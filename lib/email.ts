
import nodemailer from 'nodemailer'
import db from '@/lib/db'

async function getTransporter() {
    const configs = await db.platformConfig.findMany({
        where: { group: 'TECH' }
    })

    const smtpHost = configs.find(c => c.key === 'smtp_host')?.value
    const smtpUser = configs.find(c => c.key === 'smtp_user')?.value
    const smtpPass = configs.find(c => c.key === 'smtp_pass')?.value
    const smtpPort = configs.find(c => c.key === 'smtp_port')?.value || '587'

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn("SMTP Configuration missing")
        return null
    }

    return nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    })
}

export async function sendEmail(to: string, subject: string, html: string) {
    const transporter = await getTransporter()

    // Fallback or dev mode logging if no transporter
    if (!transporter) {
        console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`)
        return false
    }

    const branding = await db.platformConfig.findFirst({ where: { key: 'platform_name' } })
    const fromName = branding?.value || 'Alternance 360'
    const fromEmail = (await db.platformConfig.findFirst({ where: { key: 'support_email' } }))?.value || 'no-reply@alternance360.com'

    try {
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html
        })
        return true
    } catch (error) {
        console.error("Email sending failed:", error)
        return false
    }
}

export async function sendTenantWelcomeEmail(email: string, tenantName: string, loginUrl: string) {
    const subject = `Bienvenue sur ${tenantName} - Votre espace est prêt`

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Bienvenue ! 🚀</h1>
        <p>Bonjour,</p>
        <p>Votre espace de formation <strong>${tenantName}</strong> a été créé avec succès.</p>
        <p>Vous pouvez dès à présent vous connecter pour configurer votre catalogue et inviter vos équipes.</p>
        
        <div style="margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Accéder à mon Espace
            </a>
        </div>

        <p>Identifiant : ${email}<br>Mot de passe temporaire : password123</p>
        
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Cet email est envoyé automatiquement par la plateforme Alternance 360.</p>
    </div>
    `

    return await sendEmail(email, subject, html)
}
