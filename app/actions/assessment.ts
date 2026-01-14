'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// Types
type AssessmentEntry = {
    competence_id: string
    level_initial: number // 0-4
    comment?: string
}

export async function saveDraft(contractId: string, assessmentId: string | null, entries: AssessmentEntry[]) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    try {
        let finalAssessmentId = assessmentId;

        if (!finalAssessmentId) {
            const newSession = await db.initialAssessment.create({
                data: {
                    contractId: contractId,
                    userId: session.user.id,
                    status: 'DRAFT'
                }
            })
            finalAssessmentId = newSession.id
        }

        const userId = session.user.id
        // 2. Upsert Entries
        const records = entries.map(e => ({
            assessmentId: finalAssessmentId!,
            userId: userId!,
            competenceId: e.competence_id,
            levelInitial: e.level_initial,
            targetLevel: 1, // Defaulting to 1 for required field in createMany
        }))

        // Perform in transaction
        await db.$transaction(async (tx) => {
            const compIds = entries.map(e => e.competence_id)
            await tx.positioning.deleteMany({
                where: {
                    assessmentId: finalAssessmentId!,
                    competenceId: { in: compIds }
                }
            })

            await tx.positioning.createMany({
                data: records
            })
        })

        return { success: true, assessmentId: finalAssessmentId }

    } catch (e: any) {
        console.error('Save Draft Failed:', e)
        return { success: false, error: e.message }
    }
}

export async function submitAssessment(assessmentId: string) {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')

    try {
        const assessment = await db.initialAssessment.update({
            where: { id: assessmentId },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date()
            },
            select: { contractId: true }
        })

        if (assessment.contractId) {
            // AUTOMATION: Generate TSF
            try {
                const { generateTSF } = await import('./generate-tsf')
                await generateTSF(assessment.contractId)
            } catch (err) {
                console.error("Automated TSF generation failed:", err)
            }
        }

        revalidatePath(`/dashboard`)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

import { PERMISSIONS, requirePermission } from '@/lib/permissions'

export async function validateAssessment(assessmentId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    // RBAC Check: Must have TSF_VALIDATE permission
    requirePermission(session.user, PERMISSIONS.TSF_VALIDATE)

    try {
        // 1. Update Status
        const assessment = await db.initialAssessment.update({
            where: { id: assessmentId },
            data: {
                status: 'VALIDATED',
                validatedAt: new Date(),
                validatorId: session.user.id
            }
        })

        // 2. TRIGGER TSF BRIDGE
        const acquisItems = await db.positioning.findMany({
            where: {
                assessmentId: assessmentId,
                levelInitial: { gte: 3 }
            },
            select: { competenceId: true }
        })

        if (acquisItems.length > 0 && assessment.contractId) {
            const compIds = acquisItems.map(i => i.competenceId)

            await db.tSFMapping.updateMany({
                where: {
                    contractId: assessment.contractId,
                    competenceId: { in: compIds }
                },
                data: {
                    status: 'ACQUIS',
                    flagCfa: false,
                    flagEntreprise: false
                }
            })
        }

        if (assessment.contractId) {
            // TRIGGER B: Finalize TSF Workflow
            await db.contract.update({
                where: { id: assessment.contractId },
                data: {
                    tsfStatus: 'VALIDATED',
                    isLocked: true, // Auto-lock after J+7 validation
                    lockedAt: new Date(),
                    changeLog: 'Validation du diagnostic initial (J+7)'
                } as any
            })

            // Notification Log
            const contract = await db.contract.findUnique({
                where: { id: assessment.contractId },
                include: { user: true }
            })

            if (contract?.user) {
                await (db as any).notificationLog.create({
                    data: {
                        recipientId: contract.userId!,
                        type: 'PUSH',
                        title: 'Ton parcours personnalisé est prêt ! 🚀',
                        content: `Félicitations ${contract.user.firstName}, ton diagnostic a été validé. Découvre tes objectifs pour le premier semestre dans ton tableau de bord.`,
                        metadata: JSON.stringify({ contractId: contract.id })
                    }
                })
            }

            revalidatePath(`/dashboard/contracts/${assessment.contractId}`)
        }
        return { success: true }

    } catch (e: any) {
        console.error('Validate Assessment Failed:', e)
        return { success: false, error: e.message }
    }
}
