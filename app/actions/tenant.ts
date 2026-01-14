'use server'

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
