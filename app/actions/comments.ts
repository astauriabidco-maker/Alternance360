'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function addComment(proofId: string, content: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non connecté" }

    if (!content.trim()) return { error: "Commentaire vide" }

    try {
        const comment = await db.proofComment.create({
            data: {
                content,
                proofId,
                authorId: session.user.id
            },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            }
        })

        // Revalidate paths where comments might be shown
        revalidatePath('/dashboard')
        revalidatePath('/tutor/dashboard')
        revalidatePath('/pedagogie/journal')

        return { success: true, comment }
    } catch (e) {
        console.error("Add comment error:", e)
        return { error: "Erreur lors de l'ajout du commentaire" }
    }
}

export async function getComments(proofId: string) {
    // Note: Usually we might fetch this with the Proof itself, but fetching on demand works too
    try {
        const comments = await db.proofComment.findMany({
            where: { proofId },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })
        return { success: true, comments }
    } catch (e) {
        console.error("Get comments error:", e)
        return { error: "Erreur lors du chargement des commentaires" }
    }
}
