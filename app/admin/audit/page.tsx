import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import db from '@/lib/db'
import { FileCheck, Download, Calendar, Shield, Link2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AuditLinkGenerator } from './audit-link-generator'

export default async function AuditPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Accès réservé aux administrateurs.</p>
            </div>
        )
    }

    // Fetch apprentices for the link generator
    const apprentices = await db.user.findMany({
        where: { tenantId: session.user.tenantId, role: 'apprentice' },
        select: { id: true, fullName: true, email: true }
    })

    const livrets = await db.livret.findMany({
        include: {
            contract: {
                include: { user: { select: { fullName: true } } }
            }
        },
        orderBy: { generatedAt: 'desc' }
    })

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans space-y-10">
            <div className="flex items-center gap-4 mb-10">
                <div className="bg-indigo-100 p-3 rounded-2xl">
                    <Shield className="text-indigo-600 w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Audit Qualiopi</h1>
                    <p className="text-slate-500 font-medium">Générez des accès sécurisés et consultez les preuves de conformité.</p>
                </div>
            </div>

            {/* Audit Link Generator Section */}
            <AuditLinkGenerator apprentices={apprentices} />

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck size={20} className="text-emerald-600" />
                        Livrets Générés ({livrets.length})
                    </h2>
                </div>

                <div className="divide-y divide-slate-50">
                    {livrets.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            Aucun livret généré pour le moment.
                        </div>
                    ) : (
                        livrets.map((livret) => (
                            <div key={livret.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-2xl">
                                        <FileCheck className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            DOC-{livret.documentId}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {livret.contract?.user?.fullName || 'Apprenti'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {format(new Date(livret.generatedAt), 'PPP', { locale: fr })}
                                        </p>
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg ${livret.status === 'SIGNED' ? 'bg-emerald-50 text-emerald-600' :
                                            livret.status === 'ARCHIVED' ? 'bg-blue-50 text-blue-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            {livret.status}
                                        </span>
                                    </div>

                                    <Link
                                        href={livret.filePath}
                                        target="_blank"
                                        className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                        Télécharger
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
