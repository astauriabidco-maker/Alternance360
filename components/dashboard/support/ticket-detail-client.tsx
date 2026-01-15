"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, CheckCircle, Clock, AlertCircle, ArrowLeft, User as UserIcon, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { replyToTicket, updateTicketStatus } from "@/app/actions/tickets"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TicketDetailProps {
    ticket: any
    currentUserId: string
    currentUserRole: string
}

export function TicketDetailClient({ ticket, currentUserId, currentUserRole }: TicketDetailProps) {
    const router = useRouter()
    const [reply, setReply] = useState("")
    const [sending, setSending] = useState(false)
    const [updating, setUpdating] = useState(false)

    const isAdmin = currentUserRole === 'super_admin'

    const handleReply = async () => {
        if (!reply.trim()) return
        setSending(true)
        try {
            const result = await replyToTicket(ticket.id, reply)
            if (result.success) {
                setReply("")
                toast.success("Message envoyé")
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } finally {
            setSending(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true)
        try {
            await updateTicketStatus(ticket.id, newStatus)
            toast.success("Statut mis à jour")
            router.refresh()
        } finally {
            setUpdating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Ouvert</Badge>
            case 'IN_PROGRESS': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">En cours</Badge>
            case 'RESOLVED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Résolu</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" className="rounded-xl h-10 w-10 p-0" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-black text-slate-900">{ticket.subject}</h1>
                                {getStatusBadge(ticket.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase text-xs tracking-wider">
                                    {ticket.category}
                                </span>
                                <span>Ticket #{ticket.id.substring(0, 8)}</span>
                                {isAdmin && ticket.tenant && (
                                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                                        Client: {ticket.tenant.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <Select
                                    disabled={updating}
                                    defaultValue={ticket.status}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-[140px] rounded-xl bg-white border-slate-200 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Ouvert</SelectItem>
                                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                                        <SelectItem value="RESOLVED">Résolu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Conversation */}
            <div className="space-y-6">
                {ticket.messages.map((msg: any) => {
                    const isMe = msg.authorId === currentUserId
                    const isSupport = msg.author.role === 'super_admin'

                    return (
                        <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                                ${isSupport ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                {isSupport ? <ShieldCheck size={16} /> : <UserIcon size={16} />}
                            </div>

                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-xs font-bold text-slate-900">
                                        {msg.author.fullName || 'Utilisateur'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {format(new Date(msg.createdAt), 'dd MMM HH:mm', { locale: fr })}
                                    </span>
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                                    ${isMe
                                        ? 'bg-slate-900 text-white rounded-tr-sm'
                                        : isSupport
                                            ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-sm'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Reply Input */}
            {ticket.status !== 'RESOLVED' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-10 lg:pl-72">
                    <div className="max-w-4xl mx-auto flex gap-4 items-end">
                        <Textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Écrivez votre réponse..."
                            className="min-h-[60px] max-h-[200px] rounded-xl bg-slate-50 border-slate-200 resize-none focus:ring-indigo-500/20"
                        />
                        <Button
                            onClick={handleReply}
                            disabled={sending || !reply.trim()}
                            className="h-[60px] w-[60px] rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all font-black"
                        >
                            {sending ? <Clock className="animate-spin" /> : <Send />}
                        </Button>
                    </div>
                </div>
            )}

            {ticket.status === 'RESOLVED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle size={20} />
                    Ce ticket est résolu. Rouvrez-le pour répondre.
                </div>
            )}
        </div>
    )
}
