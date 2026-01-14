'use server'

import db from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export interface LivretData {
    documentId: string
    generatedAt: Date
    // Contract & User
    contract: {
        id: string
        startDate: Date
        endDate: Date
    }
    apprentice: {
        fullName: string
        email: string
    }
    tenant: {
        name: string
        logoUrl?: string | null
        primaryColor?: string | null
    }
    // Progression
    blocs: {
        id: string
        code: string
        title: string
        competences: {
            id: string
            description: string
            status: string // PENDING, ACQUIS, NON_ACQUIS
        }[]
        validatedCount: number
        totalCount: number
    }[]
    // Journal Entries
    journalEntries: {
        id: string
        title: string
        createdAt: Date
        type: string
    }[]
    // Milestones
    milestones: {
        id: string
        label: string
        dueDate: Date
        status: string
        completedAt?: Date | null
    }[]
    // Stats
    stats: {
        totalCompetences: number
        validatedCompetences: number
        progressPercent: number
        blocsValidated: number
        totalBlocs: number
    }
}

export async function consolidateLivretData(contractId: string): Promise<LivretData | null> {
    const contract = await db.contract.findUnique({
        where: { id: contractId },
        include: {
            user: true,
            tenant: true,
            referentiel: {
                include: {
                    blocs: {
                        include: {
                            competences: true
                        }
                    }
                }
            },
            tsfMapping: {
                include: {
                    competence: true
                }
            },
            milestones: true
        }
    })

    if (!contract || !contract.user) return null

    // Fetch proofs (journal entries)
    const proofs = await db.proof.findMany({
        where: { userId: contract.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    })

    // Process blocs and competences with TSF status
    const statusMap = new Map(contract.tsfMapping.map(m => [m.competenceId, m.status]))

    const blocs = contract.referentiel.blocs.map(bloc => {
        const competences = bloc.competences.map(c => ({
            id: c.id,
            description: c.description,
            status: statusMap.get(c.id) || 'PENDING'
        }))
        const validatedCount = competences.filter(c => c.status === 'ACQUIS').length
        return {
            id: bloc.id,
            code: bloc.code,
            title: bloc.title,
            competences,
            validatedCount,
            totalCount: competences.length
        }
    })

    const totalCompetences = blocs.reduce((acc, b) => acc + b.totalCount, 0)
    const validatedCompetences = blocs.reduce((acc, b) => acc + b.validatedCount, 0)
    const blocsValidated = blocs.filter(b => b.validatedCount === b.totalCount && b.totalCount > 0).length

    return {
        documentId: uuidv4().split('-')[0].toUpperCase(),
        generatedAt: new Date(),
        contract: {
            id: contract.id,
            startDate: contract.startDate,
            endDate: contract.endDate
        },
        apprentice: {
            fullName: contract.user.fullName || 'Apprenti',
            email: contract.user.email
        },
        tenant: {
            name: contract.tenant.name,
            logoUrl: contract.tenant.logoUrl,
            primaryColor: contract.tenant.primaryColor
        },
        blocs,
        journalEntries: proofs.map(p => ({
            id: p.id,
            title: p.title,
            createdAt: p.createdAt,
            type: p.type
        })),
        milestones: contract.milestones.map(m => ({
            id: m.id,
            label: m.label,
            dueDate: m.dueDate,
            status: m.status,
            completedAt: m.completedAt
        })),
        stats: {
            totalCompetences,
            validatedCompetences,
            progressPercent: totalCompetences > 0 ? Math.round((validatedCompetences / totalCompetences) * 100) : 0,
            blocsValidated,
            totalBlocs: blocs.length
        }
    }
}
