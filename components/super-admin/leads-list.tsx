"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, CheckCircle, ChevronRight, Clock, Mail, XCircle, Zap, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { provisionTenant, rejectLead } from "@/app/actions/super-admin"

interface LeadsListProps {
    leads: any[]
}

export function LeadsList({ leads }: LeadsListProps) {
    const pendingLeads = leads.filter(l => l.status === 'PENDING')
    const processedLeads = leads.filter(l => l.status === 'PROCESSED' || l.status === 'REJECTED')

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PROCESSED': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5"><CheckCircle size={10} className="mr-1" /> Activé</Badge>
            case 'REJECTED': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5"><XCircle size={10} className="mr-1" /> Rejeté</Badge>
            default: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 animate-pulse"><Clock size={10} className="mr-1" /> En attente</Badge>
        }
    }

    const LeadCard = ({ lead, showActions = false }: { lead: any, showActions?: boolean }) => (
        <div key={lead.id} className="group p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-colors hover:bg-slate-50/50 border-b last:border-0 border-slate-100">
            <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                    <Building size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{lead.tenantName || 'Nouveau CFA'}</h3>
                        {getStatusBadge(lead.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            <Mail size={14} className="text-slate-300" />
                            {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            <Clock size={14} className="text-slate-300" />
                            {format(new Date(lead.createdAt), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                        {lead.source && (
                            <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                                Source: {lead.source}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {showActions ? (
                    <>
                        <Button
                            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20 gap-2"
                            onClick={async () => {
                                // Optimized: Using transition or simpler loading state could be better, but direct server action call works in client components too
                                await provisionTenant(lead.id)
                            }}
                        >
                            Provisionner <ChevronRight size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            className="h-12 px-6 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
                            onClick={async () => await rejectLead(lead.id)}
                        >
                            Refuser
                        </Button>
                    </>
                ) : (
                    <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        {lead.status === 'PROCESSED' ? 'Provisionné' : 'Traité'}
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <Tabs defaultValue="pending" className="w-full space-y-8">
            <div className="flex items-center justify-between">
                <TabsList className="h-14 p-1 rounded-2xl bg-slate-100/80 backdrop-blur border border-slate-200">
                    <TabsTrigger value="pending" className="h-12 rounded-xl px-6 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                        À traiter <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">{pendingLeads.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="h-12 rounded-xl px-6 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all">
                        Historique <Badge className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-200 border-none">{processedLeads.length}</Badge>
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="pending" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {pendingLeads.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50/50 py-20 text-center rounded-[2.5rem]">
                        <CardContent className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                                <Zap size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Tout est à jour !</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Aucune demande en attente. Profitez-en pour prendre un café ☕.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border shadow-xl shadow-slate-200/40 overflow-hidden">
                        {pendingLeads.map(lead => <LeadCard key={lead.id} lead={lead} showActions={true} />)}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {processedLeads.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-medium">Aucun historique disponible.</div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border shadow-sm divide-slate-100 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                        {processedLeads.map(lead => <LeadCard key={lead.id} lead={lead} showActions={false} />)}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
