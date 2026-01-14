import { auth } from '@/auth'
import db from '@/lib/db'
import { redirect } from 'next/navigation'
import { MarketplaceClient } from '@/components/admin/marketplace-client'

export default async function MarketplacePage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'formateur')) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Accès Refusé</h1>
                <p className="mt-2 text-gray-600">Vous n'avez pas les droits nécessaires.</p>
            </div>
        )
    }

    // Fetch only global referentiels (Marketplace = Global Library)
    const globalReferentiels = await db.referentiel.findMany({
        where: { isGlobal: true },
        include: {
            _count: { select: { blocs: true } }
        },
        orderBy: [
            { downloadCount: 'desc' },
            { createdAt: 'desc' }
        ]
    })

    return (
        <div className="container mx-auto py-8">
            <MarketplaceClient referentiels={globalReferentiels} />
        </div>
    )
}
