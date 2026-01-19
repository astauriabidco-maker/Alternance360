import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { differenceInDays, format } from 'date-fns'
import { sendEmail } from '@/lib/email'

/**
 * Secure Cron Endpoint for Daily Alerts
 * Called by external scheduler (Vercel Cron, Railway Cron, or manual trigger)
 * Protected by CRON_SECRET environment variable
 */
export async function GET(req: Request) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const contracts = await db.contract.findMany({
            include: {
                milestones: { where: { status: 'PENDING' } },
                user: true,
                formateur: true,
                tenant: true
            }
        })

        const now = new Date()
        const results = {
            reminders: 0,
            urgent: 0,
            escalations: 0,
            emailsSent: 0
        }

        for (const contract of contracts) {
            if (!contract.user) continue

            for (const milestone of contract.milestones) {
                const daysUntil = differenceInDays(new Date(milestone.dueDate), now)

                // J-7: Reminder Email
                if (daysUntil === 7) {
                    results.reminders++
                    const sent = await sendEmail(
                        contract.user.email,
                        `Rappel: ${milestone.label}`,
                        `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #4f46e5;">Rappel de Jalon</h2>
                            <p>Bonjour ${contract.user.fullName},</p>
                            <p>Votre jalon <strong>${milestone.label}</strong> arrive à échéance dans 7 jours (${format(new Date(milestone.dueDate), 'dd/MM/yyyy')}).</p>
                            <p>Pensez à préparer les éléments nécessaires.</p>
                            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px;">${contract.tenant.name} - Alternance 360</p>
                        </div>
                        `
                    )
                    if (sent) results.emailsSent++

                    // Log the notification
                    await db.notificationLog.create({
                        data: {
                            recipientId: contract.user.id,
                            type: 'EMAIL',
                            title: `Rappel Jalon: ${milestone.label}`,
                            content: `Échéance dans 7 jours`
                        }
                    })
                }

                // J: Urgent Alert
                if (daysUntil === 0) {
                    results.urgent++
                    await sendEmail(
                        contract.user.email,
                        `⚠️ URGENT: ${milestone.label} - Aujourd'hui !`,
                        `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #dc2626;">⚠️ Action Requise Aujourd'hui</h2>
                            <p>Bonjour ${contract.user.fullName},</p>
                            <p>Le jalon <strong>${milestone.label}</strong> doit être complété <strong>aujourd'hui</strong>.</p>
                            <p>Merci de vous connecter à votre espace pour finaliser cette étape.</p>
                            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px;">${contract.tenant.name}</p>
                        </div>
                        `
                    )
                    results.emailsSent++

                    await db.notificationLog.create({
                        data: {
                            recipientId: contract.user.id,
                            type: 'PUSH',
                            title: `URGENT: ${milestone.label}`,
                            content: `À compléter aujourd'hui`
                        }
                    })
                }

                // J+5: Escalation to Formateur
                if (daysUntil === -5 && contract.formateur) {
                    results.escalations++
                    await sendEmail(
                        contract.formateur.email,
                        `🚨 ESCALADE: Jalon dépassé pour ${contract.user.fullName}`,
                        `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #dc2626;">🚨 Escalade - Intervention Requise</h2>
                            <p>Bonjour ${contract.formateur.fullName},</p>
                            <p>L'apprenti <strong>${contract.user.fullName}</strong> a dépassé le jalon <strong>${milestone.label}</strong> de 5 jours.</p>
                            <p>Une intervention de votre part est recommandée.</p>
                            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
                            <p style="color: #999; font-size: 12px;">${contract.tenant.name}</p>
                        </div>
                        `
                    )
                    results.emailsSent++

                    await db.notificationLog.create({
                        data: {
                            recipientId: contract.formateur.id,
                            type: 'ALERT',
                            title: `ESCALADE: ${contract.user.fullName}`,
                            content: `Jalon "${milestone.label}" dépassé de 5 jours`
                        }
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results
        })

    } catch (error: any) {
        console.error('Cron Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
