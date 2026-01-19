import { NextResponse } from 'next/server'
import { withApiKey } from '@/lib/api-auth'
import db from '@/lib/db'
import { getContractHealth } from '@/app/actions/monitoring'

/**
 * Endpoint for BI Tools (PowerBI, Tableau) to extract data.
 * Auth: x-api-key
 * Params: type (apprentices|contracts|proofs), limit, offset
 */
async function handler(req: Request, tenant: any) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'apprentices'
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let data: any[] = []

        switch (type) {
            case 'apprentices':
                const users = await db.user.findMany({
                    where: { tenantId: tenant.id, role: 'apprentice' },
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        externalId: true,
                        createdAt: true,
                        _count: { select: { proofs: true } }
                    },
                    take: limit,
                    skip: offset
                })
                data = users
                break

            case 'contracts':
                const contracts = await db.contract.findMany({
                    where: { tenantId: tenant.id },
                    include: {
                        user: { select: { email: true, fullName: true } },
                        referentiel: { select: { codeRncp: true, title: true } }
                    },
                    take: limit,
                    skip: offset
                })

                // Add health score for each contract
                data = await Promise.all(contracts.map(async (c) => {
                    const health = await getContractHealth(c.id)
                    return {
                        id: c.id,
                        apprentice: c.user?.fullName,
                        email: c.user?.email,
                        startDate: c.startDate,
                        endDate: c.endDate,
                        rncp: c.referentiel?.codeRncp,
                        healthScore: health?.score || 0,
                        healthStatus: health?.status || 'UNKNOWN'
                    }
                }))
                break

            case 'proofs':
                data = await db.proof.findMany({
                    where: { user: { tenantId: tenant.id } },
                    include: {
                        user: { select: { email: true } },
                        competence: { select: { description: true } }
                    },
                    take: limit,
                    skip: offset
                })
                break

            default:
                return NextResponse.json({ error: 'Invalid export type. Supported: apprentices, contracts, proofs' }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            type,
            count: data.length,
            data
        })

    } catch (error: any) {
        console.error("BI API Export Error:", error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export const GET = withApiKey(handler)
