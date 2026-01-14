
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding TSF Data...')

    // 1. Ensure Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'demo-tenant' },
        update: {},
        create: { id: 'demo-tenant', name: 'CFA Demo' }
    })

    // 2. Ensure User (Apprentice)
    const user = await prisma.user.upsert({
        where: { email: 'apprenti@demo.com' },
        update: {
            password: await bcrypt.hash('password123', 10)
        },
        create: {
            email: 'apprenti@demo.com',
            role: 'apprentice',
            firstName: 'Jean',
            lastName: 'Dupont',
            tenantId: tenant.id,
            password: await bcrypt.hash('password123', 10)
        }
    })



    // 2b. Ensure Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {
            password: await bcrypt.hash('password123', 10)
        },
        create: {
            email: 'admin@demo.com',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'CFA',
            tenantId: tenant.id,
            password: await bcrypt.hash('password123', 10)
        }
    })

    // 3. Create Rich Referentiel (BTS MCO)
    const ref = await prisma.referentiel.upsert({
        where: { id: 'ref-bts-mco' },
        update: {},
        create: {
            id: 'ref-bts-mco',
            codeRncp: 'RNCP34031',
            title: 'BTS - Management Commercial Opérationnel',
            tenantId: tenant.id,
            isGlobal: true,
            blocs: {
                create: [
                    {
                        title: 'Développer la relation client et vente conseil',
                        orderIndex: 1,
                        competences: {
                            create: [
                                {
                                    description: 'C1. Assurer la veille informationnelle',
                                    indicateurs: {
                                        create: [
                                            { description: 'Collecter des informations sur le marché' },
                                            { description: 'Analyser la concurrence locale' },
                                            { description: 'Synthétiser les données clients' }
                                        ]
                                    }
                                },
                                {
                                    description: 'C2. Réaliser la vente conseil',
                                    indicateurs: {
                                        create: [
                                            { description: 'Accueillir le client selon les codes de l\'enseigne' },
                                            { description: 'Identifier les besoins par un questionnement adapté' },
                                            { description: 'Proposer une solution commerciale argumentée' }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        title: 'Animer et dynamiser l\'offre commerciale',
                        orderIndex: 2,
                        competences: {
                            create: [
                                {
                                    description: 'C3. Elaborer et adapter l\'offre',
                                    indicateurs: {
                                        create: [
                                            { description: 'Mettre en place les actions promotionnelles' },
                                            { description: 'Optimiser l\'implantation des produits (Merchandising)' }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    })

    // 4. Create Contract linked to User and Referentiel
    const contract = await prisma.contract.create({
        data: {
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            tenantId: tenant.id,
            userId: user.id,
            referentielId: ref.id,
            tsfStatus: 'DRAFT'
        }
    })

    console.log(`Created Contract ID: ${contract.id} for Referentiel ${ref.title}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
