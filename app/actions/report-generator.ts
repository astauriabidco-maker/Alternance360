'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import crypto from 'crypto'

export type BlockReport = {
    id: string
    title: string
    code: string | null
    totalIndicators: number
    acquiredIndicators: number
    percent: number
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'VALIDATED'
    lastSignedAt: Date | null
    latestComment: string | null
}

export type ProgressReport = {
    generatedAt: Date
    apprenticeName: string
    contractId: string
    referentielTitle: string
    blocks: BlockReport[]
    globalAverage: number
    verificationHash: string
}

export async function generateProgressData(contractId: string): Promise<ProgressReport> {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // 1. Fetch Contract & Deep TSF
    const contract = await db.contract.findUnique({
        where: { id: contractId },
        include: {
            user: true,
            referentiel: true
        }
    })

    if (!contract || !contract.referentielId) throw new Error("Contrat invalide")

    // 2. Fetch Blocks + Evaluations
    const blocs = await db.blocCompetence.findMany({
        where: { referentielId: contract.referentielId },
        include: {
            competences: {
                include: {
                    indicateurs: {
                        include: {
                            evaluations: {
                                where: { contractId: contractId },
                                orderBy: { updatedAt: 'desc' },
                                take: 1
                            }
                        }
                    }
                }
            }
        },
        orderBy: { orderIndex: 'asc' }
    })

    // 3. Aggregate Data
    let globalTotal = 0
    let globalAcquired = 0

    const blocksReport: BlockReport[] = blocs.map(bloc => {
        const allIndicators = bloc.competences.flatMap(c => c.indicateurs)
        const total = allIndicators.length

        // Evaluations for this block
        const evaluations = allIndicators.flatMap(i => i.evaluations)

        // Acquired count
        const acquired = evaluations.filter(e => e.status === 'ACQUIS').length

        // Last Signed Date (Max of signedAt)
        // We use 'checkedAt' or 'signedAt' depending on what is available, preferring signedAt
        const times = evaluations
            .map(e => e.signedAt ? e.signedAt.getTime() : (e.checkedAt ? e.checkedAt.getTime() : 0))
            .filter(t => t > 0)
        const lastSignedAt = times.length > 0 ? new Date(Math.max(...times)) : null

        // Latest Comment
        // Find evaluaton with comment, sort by date
        const validComments = evaluations
            .filter(e => e.comment && e.comment.trim().length > 0)
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        const latestComment = validComments.length > 0 ? validComments[0].comment : null

        const percent = total > 0 ? Math.round((acquired / total) * 100) : 0

        let status: BlockReport['status'] = 'NOT_STARTED'
        if (acquired > 0) status = 'IN_PROGRESS'
        if (percent === 100) status = 'VALIDATED'

        globalTotal += total
        globalAcquired += acquired

        return {
            id: bloc.id,
            title: bloc.title,
            code: null, // Bloc code not in schema yet, using null or title prefix if parsed
            totalIndicators: total,
            acquiredIndicators: acquired,
            percent,
            status,
            lastSignedAt,
            latestComment
        }
    })

    const globalAverage = globalTotal > 0 ? Math.round((globalAcquired / globalTotal) * 100) : 0

    // 4. Verification Hash
    // We hash the core data to ensure integrity
    const payloadToHash = JSON.stringify({
        contractId,
        date: new Date().toISOString().split('T')[0], // Day precision
        stats: blocksReport.map(b => ({ id: b.id, p: b.percent, s: b.lastSignedAt?.toISOString() }))
    })
    const verificationHash = crypto.createHash('sha256').update(payloadToHash).digest('hex').substring(0, 12).toUpperCase()

    return {
        generatedAt: new Date(),
        apprenticeName: `${contract.user?.firstName || ''} ${contract.user?.lastName || ''}`.trim(),
        contractId: contract.id,
        referentielTitle: contract.referentiel?.title || 'Référentiel',
        blocks: blocksReport,
        globalAverage,
        verificationHash
    }
}
