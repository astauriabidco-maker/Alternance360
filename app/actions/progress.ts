'use server'

import db from '@/lib/db'
import { auth } from '@/auth'

export async function getCompetenceProfile(userId?: string) {
    const session = await auth()
    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
        return { error: "Non authentifié", data: [] }
    }

    try {
        // 1. Fetch relevant contract for the user to get the referentiel
        const contract = await db.contract.findFirst({
            where: { userId: targetUserId } as any,
            orderBy: { createdAt: 'desc' },
            select: { referentielId: true }
        })

        if (!contract) {
            return { error: "Aucun contrat trouvé", data: [] }
        }

        // 2. Fetch Blocs and Competences for this referentiel
        const blocs = await db.blocCompetence.findMany({
            where: { referentielId: (contract as any).referentielId },
            include: {
                competences: {
                    include: {
                        proofs: {
                            where: {
                                userId: targetUserId,
                                status: 'VALIDATED'
                            }
                        }
                    }
                }
            } as any
        })

        // 3. Calculate score per Bloc
        const profile = blocs.map(bloc => {
            const totalCompetences = (bloc as any).competences.length
            if (totalCompetences === 0) return { label: bloc.title, value: 0 }

            const validatedCount = (bloc as any).competences.filter((comp: any) => comp.proofs.length > 0).length
            const percentage = Math.round((validatedCount / totalCompetences) * 100)

            return {
                label: bloc.title.length > 15 ? bloc.title.substring(0, 12) + "..." : bloc.title,
                value: percentage
            }
        })

        return { success: true, data: profile }
    } catch (e) {
        console.error("Error fetching progress:", e)
        return { error: "Erreur lors de la récupération du profil", data: [] }
    }
}
