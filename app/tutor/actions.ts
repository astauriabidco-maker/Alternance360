'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/upload'

export async function validateCompetence(tsfId: string, status: 'ACQUIS' | 'NON_ACQUIS') {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non connecté" }

    // TODO: Verify user is tutor/formateur linked to this contract
    // For MVP, simple update

    try {
        await db.tSFMapping.update({
            where: { id: tsfId },
            data: { status }
        })

        revalidatePath('/tutor/dashboard')
        return { success: true }
    } catch (e) {
        console.error("Validation error:", e)
        return { error: "Erreur serveur" }
    }
}

export async function uploadSignature(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non connecté" }

    try {
        const file = formData.get('signature') as File
        if (!file || file.size === 0) return { error: "Aucun fichier reçu" }

        // 1. Upload File
        const fileUrl = await uploadFile(file, 'signatures')

        // 2. Create Proof Record
        // Ideally we should link this to a specific "Report" or "Period".
        // For MVP, we just create a Proof of type "BILAN_SIGNE" for the current logged-in tutor
        // This is slightly confusing in DB schema (userId refers to Apprentice usually).
        // Let's assume the Tutor signs ON BEHALF OF an apprentice or we store it nicely.
        // HACK: We will store it with userId = session.user.id (The Tutor) for now, 
        // to show it somewhere, OR even better, create it without userId if optional? No userId is required.
        // Let's just create it linked to the Tutor for history trace.

        await db.proof.create({
            data: {
                userId: session.user.id, // Linked to Tutor for trace
                title: "Signature Bilan de Période",
                description: "Validation des compétences de la période.",
                url: fileUrl,
                type: 'SIGNATURE',
                status: 'VALIDATED'
            }
        })

        return { success: true }
    } catch (e) {
        console.error("Signature upload error:", e)
        return { error: "Erreur lors de la sauvegarde" }
    }
}
