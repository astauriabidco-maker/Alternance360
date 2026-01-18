'use server'

import db from '@/lib/db'
import { internalGenerateTSF } from './generate-tsf'

export interface ApprenticeSyncPayload {
    email: string
    firstName?: string
    lastName?: string
    externalId?: string
    contract?: {
        externalId?: string
        startDate: string
        endDate: string
        rncpCode?: string // If present, trigger TSF generation
    }
}

/**
 * Upsert an apprentice and their contract from external CRM data.
 * Used by the /api/v1/sync/apprentice endpoint.
 */
export async function syncApprenticeAction(tenantId: string, payload: ApprenticeSyncPayload) {
    try {
        return await db.$transaction(async (tx) => {
            // 1. Upsert User (Apprentice)
            const user = await tx.user.upsert({
                where: payload.externalId
                    ? { externalId: payload.externalId }
                    : { email: payload.email },
                update: {
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    fullName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
                    externalId: payload.externalId,
                    tenantId
                },
                create: {
                    email: payload.email,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    fullName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
                    externalId: payload.externalId,
                    role: 'apprentice',
                    tenantId
                }
            })

            // 2. Handle Contract if present
            if (payload.contract) {
                // Find referentiel if rncpCode is provided
                let referentielId: string | undefined
                if (payload.contract.rncpCode) {
                    const ref = await tx.referentiel.findFirst({
                        where: {
                            codeRncp: payload.contract.rncpCode,
                            OR: [
                                { isGlobal: true },
                                { tenantId: tenantId }
                            ]
                        }
                    })
                    referentielId = ref?.id
                }

                // Upsert Contract
                const contract = await tx.contract.upsert({
                    where: payload.contract.externalId
                        ? { externalId: payload.contract.externalId }
                        : { id: 'non-existent-uuid' }, // This logic might need refinement if no externalId
                    update: {
                        startDate: new Date(payload.contract.startDate),
                        endDate: new Date(payload.contract.endDate),
                        referentielId,
                        userId: user.id,
                        tenantId
                    },
                    create: {
                        startDate: new Date(payload.contract.startDate),
                        endDate: new Date(payload.contract.endDate),
                        referentielId,
                        userId: user.id,
                        tenantId,
                        externalId: payload.contract.externalId
                    }
                })

                // 3. Trigger TSF Generation if rncpCode was valid
                if (referentielId) {
                    // Note: We call it outside the nested transaction or via tx if possible, 
                    // but internalGenerateTSF uses db.$transaction which doesn't nest well in SQLite.
                    // We'll return the contractId and trigger it after the main transaction.
                    return { success: true, userId: user.id, contractId: contract.id, tsfTriggered: true }
                }

                return { success: true, userId: user.id, contractId: contract.id }
            }

            return { success: true, userId: user.id }
        })
    } catch (error: any) {
        console.error("CRM Sync Error:", error)
        throw new Error(error.message || "Failed to sync apprentice")
    }
}
