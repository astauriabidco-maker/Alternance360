'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Milestone {
    id: string
    label: string
    dueDate: Date
    status: string
}

export function MilestoneWidget({ milestones }: { milestones: Milestone[] }) {
    return (
        <Card className="bg-white border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="text-indigo-600" size={20} />
                    Mes Prochains Jalons
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {milestones.length === 0 && (
                        <div className="p-10 text-center text-slate-400 text-sm">
                            Aucun jalon à venir.
                        </div>
                    )}
                    {milestones.map((m) => {
                        const isOverdue = isPast(new Date(m.dueDate)) && m.status !== 'COMPLETED'
                        return (
                            <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isOverdue ? 'bg-rose-50' : 'bg-slate-100'}`}>
                                        <Clock size={16} className={isOverdue ? 'text-rose-600' : 'text-slate-400'} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>{m.label}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                            {format(new Date(m.dueDate), 'PPP', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                                {isOverdue && (
                                    <div className="flex items-center gap-1 text-rose-600 text-[10px] font-black uppercase">
                                        <AlertCircle size={12} />
                                        Retard
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
