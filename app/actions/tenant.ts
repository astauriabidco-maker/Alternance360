'use server'

import db from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { getTenantFromHost } from "@/lib/tenant-utils"
import { headers } from "next/headers"

export async function getActiveTenantBranding() {
    const host = (await headers()).get("host")
    const tenant = await getTenantFromHost(host)

    return {
        name: tenant?.name || "Alternance360",
        logoUrl: tenant?.logoUrl || null,
        primaryColor: tenant?.primaryColor || "#1e3a8a", // Default Blue 900
        tenantId: tenant?.id || null
    }
}

export async function getTenantSettings() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user?.tenantId) return null

    return await db.tenant.findUnique({
        where: { id: user.tenantId }
    })
}

export async function updateTenantSettings(data: any) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user?.tenantId || user.role !== 'admin') throw new Error("Unauthorized")

    const updated = await db.tenant.update({
        where: { id: user.tenantId },
        data: {
            name: data.name,
            website: data.website,
            logoUrl: data.logoUrl,
            primaryColor: data.primaryColor,
            webhookUrl: data.webhookUrl,
            webhookSecret: data.webhookSecret,
        } as any
    })

    revalidatePath('/admin/settings')
    return { success: true, tenant: updated }
}
