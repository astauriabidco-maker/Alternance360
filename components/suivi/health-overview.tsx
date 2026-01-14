'use client'

import { HealthTrafficLight } from './health-traffic-light'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ContractHealthOverview } from '@/app/actions/supervision'

interface HealthOverviewProps {
    data: ContractHealthOverview[]
}

export function HealthOverview({ data }: HealthOverviewProps) {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse" />
                Santé des Contrats (Qualiopi)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.map((item) => (
                    <div key={item.contractId} className="space-y-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
                            {item.apprenticeName}
                        </p>
                        <HealthTrafficLight
                            score={item.healthScore}
                            status={item.healthStatus}
                            reasons={item.reasons}
                        />
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Aucun contrat actif à surveiller.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
