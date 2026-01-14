'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import db from '@/lib/db'

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        return { success: false, error: "Non autorisé", message: "" }
    }

    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const phone = formData.get('phone') as string
    const companyName = formData.get('company_name') as string
    const tutorName = formData.get('tutor_name') as string

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: {
                firstName,
                lastName,
                phone,
                companyName,
                tutorName,
            }
        })
    } catch (e) {
        console.error('Profile update error:', e)
        return { success: false, error: "Erreur lors de la mise à jour du profil", message: "" }
    }

    revalidatePath('/profile')
    return { success: true, message: "Profil mis à jour avec succès !", error: "" }
}
