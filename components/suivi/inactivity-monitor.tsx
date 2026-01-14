'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, Mail, CheckCircle2 } from 'lucide-react'
import { InactivityStat } from '@/app/actions/supervision'

interface InactivityMonitorProps {
    stats: InactivityStat[]
}

export function InactivityMonitor({ stats }: InactivityMonitorProps) {
    const dangerCount = stats.filter(s => s.status === 'DANGER').length
    const warningCount = stats.filter(s => s.status === 'WARNING').length

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-2 border-rose-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-rose-500 font-bold uppercase tracking-wider">Priorité Haute</CardDescription>
                        <CardTitle className="text-4xl font-black text-rose-600">{dangerCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">Apprentis inactifs depuis &gt; 7 jours</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-2 border-amber-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-amber-500 font-bold uppercase tracking-wider">Attention</CardDescription>
                        <CardTitle className="text-4xl font-black text-amber-600">{warningCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">Apprentis inactifs depuis 3-7 jours</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-none shadow-lg rounded-[2rem] overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">Activité des Apprentis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.map((stat) => (
                            <div key={stat.userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${stat.status === 'DANGER' ? 'bg-rose-500 animate-pulse' :
                                            stat.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} />
                                    <div>
                                        <h4 className="font-bold text-slate-900">{stat.fullName}</h4>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {stat.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dernière activité</p>
                                        <p className={`font-bold ${stat.status === 'DANGER' ? 'text-rose-600' :
                                                stat.status === 'WARNING' ? 'text-amber-600' : 'text-slate-700'
                                            }`}>
                                            {stat.daysInactive === -1 ? "Jamais" :
                                                stat.daysInactive === 0 ? "Aujourd'hui" :
                                                    `${stat.daysInactive} jours`}
                                        </p>
                                    </div>

                                    {stat.status === 'DANGER' ? (
                                        <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Relancer
                                        </Button>
                                    ) : (
                                        <div className="w-[100px] flex justify-end">
                                            <CheckCircle2 className="text-emerald-300 w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {stats.length === 0 && (
                            <div className="text-center py-10 text-slate-400">
                                Aucun apprenti trouvé.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
