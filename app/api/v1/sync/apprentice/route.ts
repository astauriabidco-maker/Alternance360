import { NextResponse } from 'next/server'
import { withApiKey } from '@/lib/api-auth'
import { syncApprenticeAction } from '@/app/actions/crm-sync'
import { internalGenerateTSF } from '@/app/actions/generate-tsf'
import { z } from 'zod'

const SyncSchema = z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    externalId: z.string().optional(),
    contract: z.object({
        externalId: z.string().optional(),
        startDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid startDate"),
        endDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid endDate"),
        rncpCode: z.string().optional()
    }).optional()
})

async function handler(req: Request, tenant: any) {
    try {
        const body = await req.json()

        // 1. Validation
        const result = SyncSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: result.error.format()
            }, { status: 400 })
        }

        // 2. Sync Logic (Upsert)
        const syncResult = await syncApprenticeAction(tenant.id, result.data)

        // 3. Post-sync Automation (TSF)
        if (syncResult.tsfTriggered && syncResult.contractId) {
            await internalGenerateTSF(syncResult.contractId)
        }

        return NextResponse.json({
            success: true,
            message: 'Apprentice synchronized successfully',
            data: {
                userId: syncResult.userId,
                contractId: syncResult.contractId
            }
        })

    } catch (error: any) {
        console.error("API Sync Error:", error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export const POST = withApiKey(handler)
