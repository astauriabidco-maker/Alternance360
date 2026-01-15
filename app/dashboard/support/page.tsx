import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTenantTickets } from '@/app/actions/tickets'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CreateTicketDialog } from '@/components/dashboard/support/create-ticket-dialog'

export default async function SupportPage() {
    const session = await auth()
    if (!session?.user?.tenantId) redirect('/')

    const tickets = await getTenantTickets()

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
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Technique.</h1>
                    <p className="text-slate-500 font-medium">Une question ? Un problème ? Nous sommes là pour vous aider.</p>
                </div>
                <CreateTicketDialog />
            </header>

            <div className="grid grid-cols-1 gap-4">
                {tickets.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Aucun ticket</h3>
                        <p className="text-slate-500">Vous n'avez pas encore fait de demande de support.</p>
                    </div>
                ) : (
                    tickets.map((ticket: any) => (
                        <Link
                            key={ticket.id}
                            href={`/dashboard/support/${ticket.id}`}
                            className="group block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-indigo-100"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                                        {ticket.subject}
                                    </span>
                                    {getStatusBadge(ticket.status)}
                                </div>
                                <span className="text-xs font-bold text-slate-400">
                                    {format(new Date(ticket.updatedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                                    {getPriorityIcon(ticket.priority)}
                                    <span className="text-xs uppercase tracking-wider">{ticket.priority}</span>
                                </span>
                                <span className="font-medium text-xs bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                    {ticket.category}
                                </span>
                                <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                                    <MessageSquare size={14} />
                                    <span className="font-bold">{ticket._count.messages} messages</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
