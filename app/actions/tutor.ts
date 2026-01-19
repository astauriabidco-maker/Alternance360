'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { randomBytes, createHash } from 'crypto'
import { addDays } from 'date-fns'
import { sendEmail } from '@/lib/email'

/**
 * Generates a magic link for a tutor to access a specific contract
 */
export async function sendTutorInvitation(contractId: string, tutorEmail: string, tutorName?: string) {
    const session = await auth()
    if (!session?.user?.id || !['admin', 'formateur'].includes(session.user.role)) {
        throw new Error("Unauthorized")
    }

    const tenantId = session.user.tenantId
    if (!tenantId) throw new Error("No tenant context")

    return await db.$transaction(async (tx) => {
        // 1. Ensure/Create Tutor User
        let tutor = await tx.user.findUnique({ where: { email: tutorEmail } })

        if (!tutor) {
            tutor = await tx.user.create({
                data: {
                    email: tutorEmail,
                    fullName: tutorName || tutorEmail.split('@')[0],
                    role: 'tutor_ext', // Specific role for external tutors
                    tenantId: tenantId
                }
            })
        }

        // 2. Link Tutor to Contract
        await tx.contract.update({
            where: { id: contractId },
            data: { tutorId: tutor.id }
        })

        // 3. Generate Token
        const token = randomBytes(32).toString('hex')
        const tokenHash = createHash('sha256').update(token).digest('hex')
        const expiresAt = addDays(new Date(), 7) // Link valid for 7 days

        await tx.magicToken.create({
            data: {
                tokenHash,
                userId: tutor.id,
                contractId: contractId,
                expiresAt
            }
        })

        // 4. Send Email
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:2222'
        const magicLink = `${baseUrl}/tutor/access/${token}`

        const subject = `Accès à votre Livret d'Apprentissage - Alternance 360`
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4f46e5;">Bonjour,</h2>
                <p>Vous avez été invité à valider le livret d'apprentissage en tant que tuteur entreprise.</p>
                <p>Cliquez sur le bouton ci-dessous pour accéder directement au dossier, sans mot de passe :</p>
                
                <div style="margin: 30px 0;">
                    <a href="${magicLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Accéder au Livret
                    </a>
                </div>

                <p style="color: #666; font-size: 14px;">Ce lien est unique et expirera dans 7 jours.</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">Alternance 360 - Plateforme de suivi simplifiée</p>
            </div>
        `

        await sendEmail(tutorEmail, subject, html)

        return { success: true }
    })
}

/**
 * Verifies a magic token and returns the context
 */
export async function verifyMagicToken(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const magicToken = await db.magicToken.findUnique({
        where: { tokenHash },
        include: {
            user: true,
            contract: {
                include: {
                    user: true, // Apprentice
                    tenant: true,
                    referentiel: true
                }
            }
        }
    })

    if (!magicToken || new Date() > magicToken.expiresAt) {
        return null
    }

    return {
        tutor: magicToken.user,
        contract: magicToken.contract,
        apprentice: magicToken.contract.user
    }
}
