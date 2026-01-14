import { auth } from '@/auth'
import db from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { ConfiguratorClient } from '@/components/admin/configurator-client'

interface ConfiguratorPageProps {
    params: Promise<{ id: string }>
}

export default async function ConfiguratorPage({ params }: ConfiguratorPageProps) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'formateur')) {
        return <div className="p-8 text-red-600 font-bold">Accès refusé</div>
    }

    // Fetch the full referentiel with nested structure
    const referentiel = await db.referentiel.findUnique({
        where: { id },
        include: {
            blocs: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    competences: {
                        include: {
                            indicateurs: true
                        }
                    }
                }
            }
        }
    })

    if (!referentiel) notFound()

    // Verify tenant access
    if (referentiel.tenantId !== session.user.tenantId && user.role !== 'super_admin') {
        return <div className="p-8 text-red-600 font-bold">Accès non autorisé à ce référentiel</div>
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfiguratorClient referentiel={referentiel} />
        </div>
    )
}
