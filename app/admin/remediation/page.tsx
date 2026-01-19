import { getRemediationsForTenant, getContractsNeedingRemediation } from '@/app/actions/remediation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { RemediationClient } from '@/components/admin/remediation-client'

export default async function RemediationPage() {
    const [plans, atRiskContracts] = await Promise.all([
        getRemediationsForTenant(),
        getContractsNeedingRemediation()
    ])

    const activePlans = plans.filter(p => p.status !== 'RESOLVED')
    const resolvedPlans = plans.filter(p => p.status === 'RESOLVED')

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Remédiation Qualiopi</h1>
                <p className="text-slate-500 mt-1">Indicateur 31 - Plans d'action correctifs</p>
            </div>

            {/* Alert Section */}
            {atRiskContracts.filter(c => !c.hasActivePlan).length > 0 && (
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <AlertTriangle className="text-amber-600 h-6 w-6 shrink-0" />
                            <div>
                                <p className="font-bold text-amber-900">Apprentis à risque sans plan d'action</p>
                                <p className="text-amber-800 text-sm mt-1">
                                    {atRiskContracts.filter(c => !c.hasActivePlan).length} apprenti(s) présentent un score de santé dégradé sans plan de remédiation actif.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {atRiskContracts.filter(c => !c.hasActivePlan).map(item => (
                                        <Badge key={item.contract.id} variant="outline" className="bg-white border-amber-300">
                                            {item.contract.user?.fullName} - Score: {item.health.score}%
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active Plans */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" /> Plans en cours ({activePlans.length})
                </h2>
                {activePlans.length === 0 ? (
                    <p className="text-slate-500 italic">Aucun plan de remédiation actif.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activePlans.map(plan => (
                            <RemediationClient key={plan.id} plan={plan} />
                        ))}
                    </div>
                )}
            </div>

            {/* Resolved Plans */}
            {resolvedPlans.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" /> Plans clôturés ({resolvedPlans.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {resolvedPlans.slice(0, 4).map(plan => (
                            <Card key={plan.id} className="opacity-70">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{plan.contract.user?.fullName}</CardTitle>
                                        <Badge className="bg-green-100 text-green-700">Résolu</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500 line-clamp-1">{plan.triggerReason}</p>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Clôturé le {plan.resolvedAt?.toLocaleDateString('fr-FR')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
