'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function validateProof(proofId: string, status: 'VALIDATED' | 'REJECTED', comment: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    try {
        // 1. Role Check
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (!user || !['admin', 'formateur', 'super_admin'].includes(user.role)) {
            throw new Error('Unauthorized: Only trainers can validate proofs')
        }

        // 2. Update Proof Status
        await db.proof.update({
            where: { id: proofId },
            data: {
                status,
                feedback: comment, // comment maps to feedback in Prisma
            }
        })

        revalidatePath('/dashboard/trainer/validation')
        return { success: true }

    } catch (e: any) {
        console.error('Validation failed:', e)
        return { success: false, error: e.message }
    }
}
