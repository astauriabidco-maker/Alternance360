'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

interface TSFUpdatePayload {
    mappingId?: string
    contractId: string
    competenceId: string
    periodId: string
    flag_cfa: boolean
    flag_entreprise: boolean
}

export async function updateTSFCell(payload: TSFUpdatePayload) {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')

    try {
        const { contractId, competenceId, periodId, flag_cfa, flag_entreprise } = payload

        // Fetch user context if needed, but here we just need to ensure the action is safe
        // For MVP we assume the formateur/admin is calling this.

        // Upsert Logic:
        await db.tSFMapping.upsert({
            where: {
                contractId_competenceId_periodId: {
                    contractId,
                    competenceId,
                    periodId
                }
            },
            update: {
                flagCfa: flag_cfa,
                flagEntreprise: flag_entreprise,
                status: 'PLANIFIE'
            },
            create: {
                contractId,
                competenceId,
                periodId,
                flagCfa: flag_cfa,
                flagEntreprise: flag_entreprise,
                status: 'PLANIFIE'
            }
        })

        revalidatePath(`/dashboard/contracts/${contractId}`)
        return { success: true }
    } catch (e: any) {
        console.error('Update TSF Cell Failed:', e)
        return { success: false, error: e.message }
    }
}
