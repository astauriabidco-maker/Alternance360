const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const refs = await prisma.referentiel.findMany({
        where: { isGlobal: false },
        select: { id: true, title: true, tenantId: true }
    })
    console.log(JSON.stringify(refs, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
