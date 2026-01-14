const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Create a Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'cfa-descartes' },
        update: {},
        create: {
            id: 'cfa-descartes',
            name: 'CFA Descartes',
            logoUrl: 'https://www.cfa-descartes.fr/wp-content/uploads/2021/03/logo-cfa-descartes-2021.png',
            primaryColor: '#e11d48', // Rose 600
        },
    })

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Users for each role
    const users = [
        { email: 'apprenti@descartes.fr', role: 'apprentice', fullName: 'Lucas Apprenti' },
        { email: 'tuteur@entreprise.fr', role: 'tutor', fullName: 'Marc Tuteur' },
        { email: 'formateur@descartes.fr', role: 'formateur', fullName: 'Alice Formatrice' },
        { email: 'admin@descartes.fr', role: 'admin', fullName: 'Jean Admin' },
    ]

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role, tenantId: tenant.id },
            create: {
                email: u.email,
                password: hashedPassword,
                fullName: u.fullName,
                role: u.role,
                tenantId: tenant.id,
            },
        })
    }

    console.log('Seed completed: 1 Tenant, 4 Users created.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
