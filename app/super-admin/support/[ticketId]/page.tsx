import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTicketDetails } from '@/app/actions/tickets'
import { TicketDetailClient } from '@/components/dashboard/support/ticket-detail-client'
import { AlertCircle } from 'lucide-react'

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params
    const session = await auth()
    if (session?.user?.role !== 'super_admin') redirect('/')

    const ticket = await getTicketDetails(ticketId)

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
                <AlertCircle size={48} className="mb-4 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-900">Ticket introuvable</h2>
                <p>Ce ticket n'existe pas ou a été supprimé.</p>
            </div>
        )
    }

    return (
        <TicketDetailClient
            ticket={ticket}
            currentUserId={session.user.id!}
            currentUserRole='super_admin'
        />
    )
}
