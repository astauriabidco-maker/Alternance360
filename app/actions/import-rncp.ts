'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Zod Schemas for Validation
const IndicateurSchema = z.object({
    label: z.string().min(1)
})

const CompetenceSchema = z.object({
    description: z.string().min(3),
    code: z.string().optional(),
    indicateurs: z.array(IndicateurSchema).optional()
})

const BlocSchema = z.object({
    title: z.string().min(3),
    competences: z.array(CompetenceSchema)
})

const RNCPSchema = z.object({
    code_rncp: z.string().min(3),
    title: z.string().min(3),
    blocs: z.array(BlocSchema)
})

export type ActionState = {
    message: string
    error?: boolean
    details?: string
}

export async function importRNCP(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const file = formData.get('file') as File
    const tenantId = formData.get('tenant_id') as string

    if (!file) return { message: 'No file uploaded', error: true }

    try {
        const text = await file.text()

        // 1. Process Input with AI if requested
        const useAI = formData.get('useAI') === 'on'
        let parsedData: z.infer<typeof RNCPSchema>

        if (useAI) {
            // Truncate if too large to avoid context window issues
            const promptContext = text.slice(0, 50000)

            // Try to extract code RNCP for context if possible (very basic regex)
            const codeMatch = text.match(/RNCP\d+/)
            const rncpCode = codeMatch ? codeMatch[0] : "INCONNU"

            const prompt = `
            Voici les données brutes d'un référentiel (format XML ou JSON).
            Code probable : ${rncpCode}.
            
            Utilise ces informations et tes connaissances pour générer une structure propre en Blocs > Compétences > Indicateurs au format JSON.
            
            Le format de sortie DOIT être une structure JSON valide correspondant strictement à ce schéma Zod :
            {
                code_rncp: string,
                title: string,
                blocs: [
                    {
                        title: string,
                        competences: [
                            {
                                description: string,
                                indicateurs: [ { label: string } ] (optionnel)
                            }
                        ]
                    }
                ]
            }

            Données brutes :
            ${promptContext}
            `

            try {
                //Dynamic import to avoid circular dep issues if any, though lib is safe
                const { generateContent } = await import('@/lib/ai')
                const aiResponse = await generateContent(prompt)

                // Clean markdown code fences if present
                const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim()
                parsedData = RNCPSchema.parse(JSON.parse(cleanJson))
            } catch (err: any) {
                console.error("AI Error:", err)
                return { message: 'AI Enrichment Failed', error: true, details: err.message }
            }
        } else {
            // Standard JSON Import
            try {
                const json = JSON.parse(text)
                parsedData = RNCPSchema.parse(json)
            } catch (e) {
                return { message: "Fichier invalide. Pour les fichiers XML, veuillez cocher l'option 'Nettoyer avec l'IA'.", error: true }
            }
        }

        // 2. Auth & RBAC Check
        const session = await auth()
        if (!session?.user?.id) throw new Error('Unauthorized')

        const currentUser = await db.user.findUnique({ where: { id: session.user.id } })
        if (!currentUser) throw new Error('User not found')

        let targetTenantId: string | undefined
        let isGlobal = false

        if (currentUser.role === 'super_admin') {
            // Super Admin can choose: specific tenant OR global (if no tenantId provided)
            targetTenantId = tenantId || undefined
            isGlobal = !targetTenantId
        } else if (currentUser.role === 'admin') {
            // Admin CFA: MUST be linked to their tenant, CANNOT be global
            if (!currentUser.tenantId) throw new Error('Admin sans tenant')
            targetTenantId = currentUser.tenantId
            isGlobal = false
        } else {
            throw new Error('Permission refusée')
        }

        // 3. Perform Import in a Transaction
        await db.$transaction(async (tx) => {
            // Upsert Referentiel
            const referentiel = await tx.referentiel.upsert({
                where: {
                    id: (await tx.referentiel.findFirst({
                        where: { tenantId: targetTenantId, codeRncp: parsedData.code_rncp }
                    }))?.id || 'new-id'
                },
                update: { title: parsedData.title },
                create: {
                    tenantId: targetTenantId,
                    isGlobal: isGlobal,
                    codeRncp: parsedData.code_rncp,
                    title: parsedData.title
                }
            })

            // Process Blocs
            for (const bloc of parsedData.blocs) {
                const blocDb = await tx.blocCompetence.upsert({
                    where: {
                        id: (await tx.blocCompetence.findFirst({
                            where: { referentielId: referentiel.id, title: bloc.title }
                        }))?.id || 'new-id'
                    },
                    update: {},
                    create: {
                        tenantId: targetTenantId,
                        referentielId: referentiel.id,
                        title: bloc.title
                    }
                })

                // Process Competences
                for (const comp of bloc.competences) {
                    const compDb = await tx.competence.upsert({
                        where: {
                            id: (await tx.competence.findFirst({
                                where: { blocId: blocDb.id, description: comp.description }
                            }))?.id || 'new-id'
                        },
                        update: { description: comp.description },
                        create: {
                            tenantId: targetTenantId,
                            blocId: blocDb.id,
                            description: comp.description
                        }
                    })

                    // Process Indicateurs (No tenantId on Indicateur normally, but check schema)
                    // Schema: Indicateur has no tenantId, so no change needed here.
                    if (comp.indicateurs && comp.indicateurs.length > 0) {
                        for (const ind of comp.indicateurs) {
                            const existingInd = await tx.indicateur.findFirst({
                                where: { competenceId: compDb.id, description: ind.label }
                            })

                            if (!existingInd) {
                                await tx.indicateur.create({
                                    data: {
                                        competenceId: compDb.id,
                                        description: ind.label
                                    }
                                })
                            }
                        }
                    }
                }
            }
        })

        revalidatePath('/admin/import')
        return { message: `Imported ${parsedData.code_rncp} with success`, error: false }

    } catch (e: any) {
        console.error('Import error:', e)
        if (e instanceof z.ZodError) {
            return { message: 'Validation Error', error: true, details: JSON.stringify(e.issues) }
        }
        return { message: 'Import failed', error: true, details: e.message }
    }
}
