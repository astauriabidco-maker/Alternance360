'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { dispatchWebhook } from '@/lib/webhooks'

/**
 * Gets the signature status of a livret
 */
export async function getSignatureStatus(livretId: string) {
    const livret = await db.livret.findUnique({
        where: { id: livretId },
        select: {
            id: true,
            status: true,
            apprenticeSignedAt: true,
            tutorSignedAt: true,
            cfaSignedAt: true,
            contract: {
                include: {
                    user: { select: { fullName: true } },
                    tutor: { select: { fullName: true } }
                }
            }
        }
    })

    if (!livret) return null

    return {
        apprentice: {
            name: livret.contract.user?.fullName || 'Apprenti',
            signedAt: livret.apprenticeSignedAt
        },
        tutor: {
            name: livret.contract.tutor?.fullName || 'Tuteur Entreprise',
            signedAt: livret.tutorSignedAt
        },
        cfa: {
            name: 'CFA',
            signedAt: livret.cfaSignedAt
        },
        isFullySigned: !!(livret.apprenticeSignedAt && livret.tutorSignedAt && livret.cfaSignedAt),
        status: livret.status
    }
}

/**
 * Apprentice signs the livret
 */
export async function signAsApprentice(livretId: string, signatureData: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const livret = await db.livret.findUnique({
        where: { id: livretId },
        include: { contract: true }
    })

    if (!livret) throw new Error("Livret not found")
    if (livret.contract.userId !== session.user.id) {
        throw new Error("Only the apprentice can sign here")
    }

    await db.livret.update({
        where: { id: livretId },
        data: {
            apprenticeSignedAt: new Date(),
            apprenticeSignatureData: signatureData
        }
    })

    await checkAndFinalizeSignatures(livretId)
    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Tutor signs the livret (via Magic Link or session)
 */
export async function signAsTutor(livretId: string, signatureData: string, tokenOverride?: string) {
    // Allow signature via Magic Link token
    let tutorId: string | undefined

    if (tokenOverride) {
        const { createHash } = await import('crypto')
        const tokenHash = createHash('sha256').update(tokenOverride).digest('hex')
        const magicToken = await db.magicToken.findUnique({
            where: { tokenHash },
            include: { contract: true }
        })

        if (!magicToken || new Date() > magicToken.expiresAt) {
            throw new Error("Invalid or expired token")
        }
        tutorId = magicToken.userId
    } else {
        const session = await auth()
        if (!session?.user?.id) throw new Error("Unauthorized")
        tutorId = session.user.id
    }

    const livret = await db.livret.findUnique({
        where: { id: livretId },
        include: { contract: true }
    })

    if (!livret) throw new Error("Livret not found")
    if (livret.contract.tutorId !== tutorId) {
        throw new Error("Only the assigned tutor can sign here")
    }

    await db.livret.update({
        where: { id: livretId },
        data: {
            tutorSignedAt: new Date(),
            tutorSignatureData: signatureData
        }
    })

    await checkAndFinalizeSignatures(livretId)
    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * CFA Admin signs the livret
 */
export async function signAsCFA(livretId: string, signatureData: string) {
    const session = await auth()
    if (!session?.user?.id || !['admin', 'formateur'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const livret = await db.livret.findUnique({
        where: { id: livretId },
        include: { tenant: true, contract: { include: { user: true } } }
    })

    if (!livret) throw new Error("Livret not found")
    if (livret.tenantId !== session.user.tenantId) {
        throw new Error("Tenant mismatch")
    }

    await db.livret.update({
        where: { id: livretId },
        data: {
            cfaSignedAt: new Date(),
            cfaSignatureData: signatureData
        }
    })

    await checkAndFinalizeSignatures(livretId)
    revalidatePath('/dashboard')
    revalidatePath('/admin/livrets')
    return { success: true }
}

/**
 * Checks if all 3 signatures are present and finalizes the livret
 */
async function checkAndFinalizeSignatures(livretId: string) {
    const livret = await db.livret.findUnique({
        where: { id: livretId },
        include: { tenant: true, contract: { include: { user: true } } }
    })

    if (!livret) return

    const isComplete = livret.apprenticeSignedAt && livret.tutorSignedAt && livret.cfaSignedAt

    if (isComplete && livret.status !== 'FULLY_SIGNED') {
        await db.livret.update({
            where: { id: livretId },
            data: {
                status: 'FULLY_SIGNED',
                signedAt: new Date()
            }
        })

        // Dispatch webhook for fully signed livret
        dispatchWebhook(livret.tenant, 'LIVRET_SIGNED', {
            livretId: livret.id,
            apprenticeEmail: livret.contract.user?.email,
            downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}${livret.filePath}`,
            tripartite: true,
            signedAt: new Date().toISOString()
        }).catch(err => console.error("Webhook Dispatch Failed:", err))
    }
}
