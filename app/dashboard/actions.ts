'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import db from '@/lib/db'
import { uploadFile } from '@/lib/upload'

export async function uploadProof(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { success: false, error: "Non autorisé", message: "" }
    }

    const file = formData.get('file') as File
    const titre = formData.get('titre') as string

    if (!file || file.size === 0) {
        return { success: false, error: "Aucun fichier sélectionné", message: "" }
    }

    let fileUrl = ""
    try {
        fileUrl = await uploadFile(file, session.user.id)
    } catch (e) {
        console.error('Upload error:', e)
        return { success: false, error: "Erreur lors du stockage du fichier.", message: "" }
    }

    try {
        await db.proof.create({
            data: {
                title: titre || 'Sans titre',
                url: fileUrl,
                type: file.type.includes('pdf') ? 'PDF' : 'PHOTO',
                status: 'PENDING',
                userId: session.user.id
            }
        })
    } catch (e) {
        console.error('Database error:', e)
        return { success: false, error: "Erreur lors de l'enregistrement en base", message: "" }
    }

    revalidatePath('/dashboard')
    return { success: true, message: "Preuve ajoutée avec succès !", error: "" }
}
