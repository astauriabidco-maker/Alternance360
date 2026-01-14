const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Starting Auth Debug Logic...")

    const email = "admin@demo.com"
    const password = "password123"

    console.log(`Checking logic for: ${email}`)

    if (email === "admin@demo.com" && password === "password123") {
        console.log("Hardcoded match found.")

        // Check if user exists in DB
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            console.log("User not found in DB. Attempting to seed...")
            // Default Tenant
            let tenant = await prisma.tenant.findFirst({ where: { name: "Demo Tenant" } })
            if (!tenant) {
                console.log("Creating Demo Tenant...")
                tenant = await prisma.tenant.create({ data: { name: "Demo Tenant" } })
            } else {
                console.log(`Found existing tenant: ${tenant.id}`)
            }

            console.log("Creating Admin User...")
            user = await prisma.user.create({
                data: {
                    email,
                    fullName: "Admin Demo",
                    role: "admin",
                    tenantId: tenant.id
                }
            })
            console.log("Admin User Created:", user)
        } else {
            console.log("User found in DB:", user)
        }

        console.log("Auth Successful (Simulated)")
    } else {
        console.log("No hardcoded match.")
    }
}

main()
    .catch(e => {
        console.error("ERROR:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
