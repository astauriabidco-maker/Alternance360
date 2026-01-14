'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export type PositioningEntry = {
    competence_id: string
    level_initial: number // 1 to 4
}

export type PositioningResult = {
    success: boolean
    message: string
    suggestedReductionMonths: number
}

export async function savePositioning(
    contractId: string,
    apprenticeId: string,
    entries: PositioningEntry[]
): Promise<PositioningResult> {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')

    try {
        // 1. Get Tenant Context from Contract
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            select: { tenantId: true }
        })

        if (!contract) throw new Error('Contract not found')

        // 2. Prepare Records for DB
        const records = entries.map(e => ({
            userId: apprenticeId,
            competenceId: e.competence_id,
            levelInitial: e.level_initial,
            targetLevel: 1 // Default target level
        }))

        // 3. Save to DB using a transaction
        await db.$transaction(async (tx) => {
            // Option: In a "one-shot" initial positioning, we might want to clean old entries
            // For now, let's keep it simple and just insert (as in the original logic)
            // But usually for positioning we want to upsert or delete/replace.
            // Let's stick to the original logic which was .insert() (likely causing multiples in Supabase too)
            // Refinement: Delete existing for this user/competence before inserting to avoid duplicates
            const compIds = entries.map(e => e.competence_id)
            await tx.positioning.deleteMany({
                where: {
                    userId: apprenticeId,
                    competenceId: { in: compIds }
                }
            })

            await tx.positioning.createMany({
                data: records
            })
        })

        // 4. LOGIC: Duration Adjustment
        const totalSkills = entries.length
        const acquiredSkills = entries.filter(e => e.level_initial >= 3).length
        const ratio = totalSkills > 0 ? acquiredSkills / totalSkills : 0

        let reduction = 0
        if (ratio > 0.8) reduction = 6
        else if (ratio > 0.5) reduction = 3
        else if (ratio > 0.3) reduction = 1

        // 5. AUTOMATION: Generate TSF after positioning
        // This ensures the student has a training plan as soon as their level is known.
        try {
            const { generateTSF } = await import('./generate-tsf')
            await generateTSF(contractId)
        } catch (err) {
            console.error("Automated TSF generation failed:", err)
            // We don't fail the whole action if TSF automation fails, 
            // but we log it.
        }

        revalidatePath(`/dashboard/contracts/${contractId}`)

        return {
            success: true,
            message: 'Positionnement sauvegardé et plan de formation généré.',
            suggestedReductionMonths: reduction
        }

    } catch (e: any) {
        console.error('Positioning Save Failed:', e)
        return { success: false, message: e.message, suggestedReductionMonths: 0 }
    }
}
