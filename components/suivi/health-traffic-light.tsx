'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface HealthTrafficLightProps {
    score: number
    status: 'GOOD' | 'WARNING' | 'DANGER'
    reasons: string[]
}

export function HealthTrafficLight({ score, status, reasons }: HealthTrafficLightProps) {
    const colorClass = status === 'GOOD' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
    const Icon = status === 'GOOD' ? CheckCircle2 : status === 'WARNING' ? AlertTriangle : XCircle

    return (
        <Card className="bg-white border-slate-200 overflow-hidden rounded-3xl shadow-sm">
            <CardContent className="p-0">
                <div className="flex items-stretch h-32">
                    <div className={`${colorClass} w-24 flex flex-col items-center justify-center text-white`}>
                        <Icon size={32} />
                        <span className="text-xl font-black mt-1">{score}</span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900">Score de Santé</h4>
                            <Badge className={`${colorClass} text-white border-none py-0`}>
                                {status === 'GOOD' ? 'Stable' : status === 'WARNING' ? 'Vigilance' : 'Critique'}
                            </Badge>
                        </div>
                        <div className="mt-2">
                            {reasons.length > 0 ? (
                                <ul className="text-xs text-slate-500 space-y-1">
                                    {reasons.slice(0, 2).map((r, i) => (
                                        <li key={i} className="flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            {r}
                                        </li>
                                    ))}
                                    {reasons.length > 2 && <li>...</li>}
                                </ul>
                            ) : (
                                <p className="text-xs text-emerald-600 font-medium">Tout est en ordre pour ce contrat.</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
