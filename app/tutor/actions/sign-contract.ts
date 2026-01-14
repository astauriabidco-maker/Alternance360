'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import db from '@/lib/db'

export async function signContract(contractId: string, signatureData: string) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { error: "Non connecté" }
    }

    // Verify Tutor Role
    const user = await db.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user || user.role !== 'tutor') {
        return { error: "Action réservée aux tuteurs" }
    }

    try {
        await db.contract.update({
            where: { id: contractId },
            data: {
                tutorSignature: signatureData, // Base64 string
                signedAt: new Date()
            }
        })
    } catch (error) {
        console.error('Signing error:', error)
        return { error: "Erreur lors de la signature" }
    }

    revalidatePath(`/tutor/contracts/${contractId}/validation`)
    return { success: true }
}
