'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function generateTSF(contractId: string) {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')

    try {
        // 1. Fetch Contract
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: { referentiel: true, user: true }
        })

        if (!contract) throw new Error('Contract not found')

        // 2. Generate Periods (Algorithm: 6 months slices)
        const startDate = new Date(contract.startDate)
        const endDate = new Date(contract.endDate)
        const durationMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())

        const nbPeriods = Math.ceil(durationMonths / 6)
        const periodsIds: string[] = []

        // Perform everything in a transaction for safety
        await db.$transaction(async (tx) => {
            // Clean existing periods
            await tx.period.deleteMany({ where: { contractId } })

            let internalDate = new Date(startDate)
            for (let i = 1; i <= nbPeriods; i++) {
                const periodEnd = new Date(internalDate)
                periodEnd.setMonth(periodEnd.getMonth() + 6)
                const actualEnd = periodEnd > endDate ? endDate : periodEnd

                const p = await tx.period.create({
                    data: {
                        contractId,
                        orderIndex: i,
                        label: `Période ${i} (Semestre)`,
                        startDate: internalDate,
                        endDate: actualEnd
                    }
                })

                periodsIds.push(p.id)
                internalDate = periodEnd
            }

            // 3. Fetch Positionnement (Initial Diagnostics)
            // Use userId from contract if available
            if (contract.userId) {
                const positions = await tx.positioning.findMany({
                    where: { userId: contract.userId },
                    select: { competenceId: true, levelInitial: true }
                })

                const acquisMap = new Set<string>()
                positions.forEach(p => {
                    if (p.levelInitial >= 3) acquisMap.add(p.competenceId)
                })

                // 4. Fetch Referentiel Structure
                const blocs = await tx.blocCompetence.findMany({
                    where: { referentielId: contract.referentielId },
                    include: { competences: true },
                    orderBy: { orderIndex: 'asc' }
                })

                // 5. Distribute Competences
                const inserts: any[] = []
                const nbBlocs = blocs.length || 1

                blocs.forEach((bloc, index) => {
                    const periodIndexRaw = Math.floor((index / nbBlocs) * periodsIds.length)
                    const targetPeriodId = periodsIds[Math.min(periodIndexRaw, periodsIds.length - 1)]

                    bloc.competences.forEach((comp) => {
                        const isAcquis = acquisMap.has(comp.id)

                        inserts.push({
                            contractId,
                            competenceId: comp.id,
                            status: isAcquis ? 'ACQUIS' : 'PENDING',
                            // In Prisma schema status default is PENDING
                            flagCfa: !isAcquis,
                            flagEntreprise: !isAcquis
                        })
                    })
                })

                // 6. Bulk Insert (Prisma createMany is good here if using Postgres, but SQLite has some limits)
                // SQLite supports createMany in Prisma 4.10+
                await tx.tSFMapping.deleteMany({ where: { contractId } })
                if (inserts.length > 0) {
                    await tx.tSFMapping.createMany({
                        data: inserts
                    })
                }
            }
        })

        revalidatePath(`/dashboard/contracts/${contractId}`)
        return { success: true }

    } catch (e: any) {
        console.error('TSF Generation Failed:', e)
        return { success: false, error: e.message }
    }
}
