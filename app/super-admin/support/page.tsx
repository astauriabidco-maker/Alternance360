import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getAllTickets } from '@/app/actions/tickets'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { MessageSquare, AlertCircle, CheckCircle, Clock, Building2 } from 'lucide-react'

export default async function AdminSupportPage() {
    const session = await auth()
    if (session?.user?.role !== 'super_admin') redirect('/')

    const tickets = await getAllTickets()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Ouvert</Badge>
            case 'IN_PROGRESS': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En cours</Badge>
            case 'RESOLVED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Résolu</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <AlertCircle size={16} className="text-rose-500" />
            case 'MEDIUM': return <Clock size={16} className="text-amber-500" />
            case 'LOW': return <CheckCircle size={16} className="text-blue-500" />
            default: return null
        }
    }

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                    <MessageSquare size={14} />
                    <span>Support Center</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Tickets.</h1>
                <p className="text-slate-500 font-medium text-lg">Gérez les demandes de support des CFAs.</p>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-6 pl-8">Sujet</th>
                            <th className="p-6">Client (CFA)</th>
                            <th className="p-6">Priorité</th>
                            <th className="p-6">Statut</th>
                            <th className="p-6">Dernière MAJ</th>
                            <th className="p-6 text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle size={48} className="text-emerald-100 mb-4" />
                                        <p className="text-slate-400 font-bold">Aucun ticket en attente</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket: any) => (
                                <tr key={ticket.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 pl-8">
                                        <div className="font-bold text-slate-900">{ticket.subject}</div>
                                        <div className="text-xs text-slate-400">{ticket.category}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                                            <Building2 size={14} className="text-slate-300" />
                                            {ticket.tenant.name}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            {getPriorityIcon(ticket.priority)}
                                            <span className="font-bold text-xs uppercase tracking-wider text-slate-500">{ticket.priority}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {getStatusBadge(ticket.status)}
                                    </td>
                                    <td className="p-6 font-medium text-slate-500">
                                        {format(new Date(ticket.updatedAt), 'dd MMM HH:mm', { locale: fr })}
                                    </td>
                                    <td className="p-6 text-right pr-8">
                                        <Link
                                            href={`/super-admin/support/${ticket.id}`}
                                            className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow transition-all hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            Traiter
                                        </Link>
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
