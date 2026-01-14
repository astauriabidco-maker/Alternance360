'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function registerLead(data: { email: string; tenantName?: string; source?: string }) {
    try {
        const lead = await db.lead.create({
            data: {
                email: data.email,
                tenantName: data.tenantName || null,
                source: data.source || 'landing_page'
            }
        })

        revalidatePath('/')
        return { success: true, leadId: lead.id }
    } catch (error) {
        console.error('Lead registration error:', error)
        return { success: false, error: 'Erreur lors de l\'inscription' }
    }
}

export async function getLeads() {
    const leads = await db.lead.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return leads
}
