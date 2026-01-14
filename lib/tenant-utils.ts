import prisma from "@/lib/db"

export async function getTenantFromHost(host: string | null) {
    if (!host) return null

    // For development (localhost), we might use a query param or a specific subdomain logic
    // Example: cfa-descartes.localhost:2222
    const subdomain = host.split(".")[0]

    // If it's just 'localhost' or 'www', we return null (main landing page)
    if (["localhost", "www", "alternance360", "app"].includes(subdomain.toLowerCase())) {
        return null
    }

    const tenant = await prisma.tenant.findFirst({
        where: {
            OR: [
                { name: { contains: subdomain } }, // Simple match for MVP
                { id: subdomain } // Or match by ID directly
            ]
        }
    })

    return tenant
}
