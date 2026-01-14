import { getAuditLogs } from "@/app/actions/super-admin"
import { Badge } from "@/components/ui/badge"
import {
    ShieldAlert,
    History,
    User,
    Building2,
    Activity,
    Search,
    Download,
    Eye,
    Clock,
    UserCircle,
    Server,
    Lock
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default async function AuditPage() {
    const logs = await getAuditLogs()

    const getActionBadge = (action: string) => {
        if (action.startsWith('AUTH_')) {
            return <Badge className="bg-rose-50 text-rose-700 border-rose-100 gap-1"><Lock size={12} /> Sécurité</Badge>
        }
        if (action.includes('USER')) {
            return <Badge className="bg-blue-50 text-blue-700 border-blue-100 gap-1"><User size={12} /> Utilisateur</Badge>
        }
        if (action.includes('TENANT') || action.includes('PROVISION')) {
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1"><Building2 size={12} /> Infrastructure</Badge>
        }
        return <Badge className="bg-slate-50 text-slate-700 border-slate-100 gap-1"><Activity size={12} /> Système</Badge>
    }

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                        <ShieldAlert size={14} />
                        <span>Security & Compliance Trails</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Journaux d'Audit.</h1>
                    <p className="text-slate-500 font-medium text-lg">Historique immuable de toutes les actions critiques du système.</p>
                </div>

                <button className="h-14 px-8 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 font-bold text-slate-600 shadow-sm flex items-center gap-2 transition-all">
                    <Download size={18} /> Exporter .LOG
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <History className="text-slate-300" />
                        <span className="font-black text-slate-900 uppercase tracking-widest text-xs">100 Derniers Événements</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-24 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center uppercase tracking-widest border border-emerald-100">Intégrité OK</div>
                    </div>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-8">Horodatage</th>
                            <th className="p-8">Catégorie</th>
                            <th className="p-8">Action</th>
                            <th className="p-8">Acteur</th>
                            <th className="p-8">Tenant cible</th>
                            <th className="p-8 text-right">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <Server size={48} className="text-slate-100 mb-4" />
                                        <p className="text-slate-400 font-bold">Aucun événement enregistré</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                                            <Clock size={14} className="text-slate-300" />
                                            {format(new Date(log.createdAt), 'HH:mm:ss')}
                                            <span className="text-slate-400 font-medium ml-2">{format(new Date(log.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        {getActionBadge(log.action)}
                                    </td>
                                    <td className="p-8">
                                        <span className="font-mono font-black text-slate-900 text-xs px-2 py-1 bg-slate-100 rounded-md">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <UserCircle size={14} className="text-slate-300" />
                                            {log.actorId}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="text-slate-500 font-medium">
                                            {log.tenantId ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    {log.tenantId}
                                                </div>
                                            ) : '-'}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <button className="text-slate-400 hover:text-blue-600 font-bold flex items-center gap-1 ml-auto transition-colors">
                                            <Eye size={16} /> JSON
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
