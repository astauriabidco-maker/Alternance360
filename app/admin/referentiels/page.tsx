import { auth } from '@/auth'
import db from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Wrench,
    Plus,
    Settings2,
    FileText,
    Library,
    ArrowRight,
    Sparkles
} from 'lucide-react'

export default async function AtelierPage() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'formateur')) {
        return (
            <div className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Accès Refusé</h1>
                <p className="mt-2 text-gray-600">Vous n'avez pas les droits nécessaires.</p>
            </div>
        )
    }


    const tenantId = session.user.tenantId
    const isSuperAdmin = user.role === 'super_admin'

    // Fetch ONLY local referentiels - for super_admin, show those with null tenantId
    const localReferentiels = await db.referentiel.findMany({
        where: isSuperAdmin
            ? { isGlobal: false, tenantId: null }
            : tenantId
                ? { tenantId, isGlobal: false }
                : { isGlobal: false },
        include: {
            _count: { select: { blocs: true, contracts: true } }
        },
        orderBy: { createdAt: 'desc' }
    })


    return (
        <div className="container mx-auto py-8 space-y-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-2">
                        <Wrench size={14} />
                        <span>Atelier de Modélisation</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                        Vos Filières<span className="text-emerald-500">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-xl">
                        Personnalisez vos référentiels importés. Ajoutez des critères spécifiques, utilisez l'IA pour enrichir vos grilles.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/marketplace">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 font-bold gap-2 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                            <Library size={18} />
                            Marketplace
                        </Button>
                    </Link>
                    <Link href="/admin/import">
                        <Button className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-emerald-600 font-bold shadow-xl shadow-slate-200 gap-2 transition-all">
                            <Plus size={18} />
                            Import XML
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Referentiel Grid */}
            {localReferentiels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localReferentiels.map((ref) => (
                        <div
                            key={ref.id}
                            className="group bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-200 transition-all flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <FileText size={28} />
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    Local
                                </Badge>
                            </div>

                            {/* Content */}
                            <div className="flex-1 mb-6">
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                                    {ref.codeRncp}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight">
                                    {ref.title}
                                </h3>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mb-6 py-4 border-y border-slate-50">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-slate-900">{ref._count.blocs}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blocs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-slate-900">{ref._count.contracts}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contrats</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Link href={`/admin/referentiels/${ref.id}/configurator`} className="flex-1">
                                    <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold gap-2 transition-all">
                                        <Settings2 size={18} />
                                        Configurer
                                    </Button>
                                </Link>
                                <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all group/btn">
                                    <Sparkles size={18} className="group-hover/btn:animate-pulse" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-400">
                        <Wrench size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">Votre Atelier est vide</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Importez un référentiel depuis la Marketplace pour commencer à personnaliser vos filières.
                    </p>
                    <Link href="/admin/marketplace">
                        <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-xl shadow-indigo-200">
                            Explorer la Marketplace
                            <ArrowRight size={18} />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
