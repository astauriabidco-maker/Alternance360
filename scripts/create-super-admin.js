const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Creating Super Admin user...')

    const email = 'superadmin@alternance360.fr'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Ensure we have a tenant (though super_admin might not strictly need one depending on logic, 
    // but the schema might require tenantId or it might be optional. 
    // Based on actions.ts, super_admin can be global.
    // Let's check schema via logic: usually admin needs tenant, super_admin might not.
    // Safe bet: attach to existing tenant or leave null if schema allows.
    // Viewing schema earlier: tenantId is optional in User? 
    // Let's attach to 'cfa-descartes' just in case, or leave null if possible. 
    // Actually, let's look at schema again quickly or just try null.
    // If error, I'll fix.

    // Actually, super_admin should be able to see everything.
    // Let's try creating without tenantId first (Global Admin).

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'super_admin',
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            fullName: 'Super Admin',
            role: 'super_admin',
            // No tenantId for global super admin
        },
    })

    console.log(`✅ Super Admin created/updated:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${user.role}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
