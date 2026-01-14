'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    Users,
    ShieldCheck,
    AlertTriangle,
    Zap,
    ArrowRight,
    Search,
    Download,
    TrendingUp,
    MessageSquare,
    Clock,
    Filter,
    HelpCircle,
    ChevronDown
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { exportNonCompliantDossiers } from '@/app/actions/supervision'

import { GovernanceKPIs, ActivityEntry, ContractHealthOverview, GovernanceFilters } from '@/app/actions/supervision'

type AdminVisionProps = {
    kpis: GovernanceKPIs
    insights: string
    activities: ActivityEntry[]
    risks: ContractHealthOverview[]
    referentiels: { id: string, title: string }[]
    formateurs: { id: string, fullName: string | null }[]
    currentFilters: GovernanceFilters
}

export function AdminVision({
    kpis,
    insights,
    activities,
    risks,
    referentiels,
    formateurs,
    currentFilters
}: AdminVisionProps) {
    const router = useRouter()
    const [isExporting, setIsExporting] = useState(false)

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search)
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const csv = await exportNonCompliantDossiers(currentFilters)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `dossiers_non_conformes_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Filter size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-none">Filtres de Gouvernance</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Segmentation par filière ou formateur</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <Select value={currentFilters.referentielId || 'all'} onValueChange={(v) => updateFilter('refId', v)}>
                        <SelectTrigger className="w-full md:w-[240px] rounded-2xl border-slate-200 font-bold bg-slate-50/50">
                            <SelectValue placeholder="Toutes les filières" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            <SelectItem value="all" className="font-bold">Toutes les filières</SelectItem>
                            {referentiels.map(r => (
                                <SelectItem key={r.id} value={r.id} className="font-medium">{r.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentFilters.formateurId || 'all'} onValueChange={(v) => updateFilter('formId', v)}>
                        <SelectTrigger className="w-full md:w-[200px] rounded-2xl border-slate-200 font-bold bg-slate-50/50">
                            <SelectValue placeholder="Tous les formateurs" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            <SelectItem value="all" className="font-bold">Tous les formateurs</SelectItem>
                            {formateurs.map(f => (
                                <SelectItem key={f.id} value={f.id} className="font-medium">{f.fullName || "Inconnu"}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* AI Insights Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden group rounded-[2rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Zap size={120} />
                </div>
                <div className="relative flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Zap className="text-white fill-white animate-pulse" size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Analyse Prédictive IA</div>
                        <p className="text-xl font-bold leading-relaxed max-w-2xl italic">
                            "{insights}"
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Zone 1: KPIs de Santé */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Apprentis Actifs"
                    value={kpis.activeApprentices.toString()}
                    icon={Users}
                    subtitle="Indicateur 1 : Diffusion d'info"
                    trend="+12% ce mois"
                    color="blue"
                    qualiopi="Cet indicateur couvre l'Indicateur 1 : Diffusion d'information auprès du public."
                />
                <KPICard
                    title="Taux J+7 (Diagnostic)"
                    value={`${kpis.j7CompletionRate}%`}
                    icon={ShieldCheck}
                    subtitle="Indicateur 2 : Adaptation"
                    color="emerald"
                    qualiopi="Couvre l'Indicateur 2 : Adaptation de la prestation aux besoins du bénéficiaire."
                />
                <KPICard
                    title="Alertes J+45 (Essai)"
                    value={kpis.j45Alerts.toString()}
                    icon={AlertTriangle}
                    subtitle="Indicateur 21 : Risques"
                    color="rose"
                    qualiopi="Couvre l'Indicateur 21 : Identification des causes d'abandon et mesures de remédiation."
                />
                <KPICard
                    title="Santé de Flotte"
                    value={`${kpis.globalRiskScore}/100`}
                    icon={TrendingUp}
                    subtitle="Indicateur 20 : Suivi"
                    color="amber"
                    qualiopi="Couvre l'Indicateur 20 : Mise en œuvre du suivi et de l'accompagnement."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Zone 2: Funnel de Conformité */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Pipeline de Conformité 🌊</CardTitle>
                            <p className="text-slate-500 font-medium text-sm">Industrialisation du parcours apprenti.</p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                                        <HelpCircle size={20} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-white border-none p-4 rounded-xl max-w-xs">
                                    <p className="text-xs font-medium">Analyse du flux de transformation : du contrat signé jusqu'à la validation définitive du TSF (Tableau de Suivi de Formation) post-diagnostic.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col gap-6">
                            <FunnelStep
                                label="Contrats Créés"
                                value={kpis.funnel.contracts}
                                total={kpis.funnel.contracts}
                                color="bg-blue-500"
                            />
                            <FunnelStep
                                label="Diagnostics Lancés"
                                value={kpis.funnel.assessments}
                                total={kpis.funnel.contracts}
                                color="bg-indigo-500"
                            />
                            <FunnelStep
                                label="TSF Validés & Verrouillés"
                                value={kpis.funnel.tsfs}
                                total={kpis.funnel.contracts}
                                color="bg-emerald-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Zone 4: Activity Feed */}
                <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden flex flex-col">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Activity Live <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                        <div className="px-8 pb-8 space-y-6">
                            {activities.length === 0 ? (
                                <p className="text-slate-400 italic text-center py-10">Aucune activité récente.</p>
                            ) : activities.map((act, i) => (
                                <motion.div
                                    key={act.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-2 bg-slate-100 rounded-full mt-1 h-auto min-h-full" />
                                    <div className="pb-2">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(act.createdAt))}</p>
                                        <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{act.title}</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{act.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Zone 3: Heatmap des Risques */}
            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="p-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Monitoring des Risques Qualiopi 🔥</CardTitle>
                        <p className="text-slate-500 font-medium text-sm">Identification préventive des ruptures pédagogiques.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="rounded-2xl border-slate-200 font-bold gap-2 hover:bg-slate-50 transition-all"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <Download size={16} className={cn(isExporting && "animate-bounce")} />
                            {isExporting ? "Chargement..." : "Export CSV (Non-conformes)"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="p-6">Apprenti</th>
                                <th className="p-6">Score de Santé</th>
                                <th className="p-6">Anomalies Détectées</th>
                                <th className="p-6 text-right">Niveau de Risque</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {risks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-300 italic">Aucun dossier à risque pour ces filtres.</td>
                                </tr>
                            ) : risks.map((risk, i) => (
                                <tr key={risk.contractId} className="group hover:bg-slate-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-slate-900">{risk.apprenticeName}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{risk.contractId.slice(0, 8)}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        risk.healthStatus === 'GOOD' ? 'bg-emerald-500' : risk.healthStatus === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
                                                    )}
                                                    style={{ width: `${risk.healthScore}%` }}
                                                />
                                            </div>
                                            <span className="font-black text-slate-700">{risk.healthScore}%</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-slate-500 font-medium">
                                        {risk.reasons.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 text-[10px]">
                                                {risk.reasons.map((r, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold uppercase">{r}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-emerald-600 italic">Dossier exemplaire</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <Badge className={cn(
                                            "rounded-full px-3 py-1 font-black uppercase tracking-widest text-[9px] border-none shadow-sm",
                                            risk.healthStatus === 'GOOD' ? 'bg-emerald-100 text-emerald-700' : risk.healthStatus === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        )}>
                                            {risk.healthStatus}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}

function KPICard({ title, value, icon: Icon, subtitle, trend, color, qualiopi }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 shadow-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
        rose: "bg-rose-50 text-rose-600 shadow-rose-100",
        amber: "bg-amber-50 text-amber-600 shadow-amber-100",
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 relative overflow-hidden group cursor-help"
                    >
                        <div className={cn("inline-flex w-12 h-12 items-center justify-center rounded-2xl mb-6 transition-all group-hover:scale-110", colors[color])}>
                            <Icon size={24} />
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
                        <div className="text-sm font-bold text-slate-400 tracking-tight">{title}</div>
                        <div className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest mt-4 flex items-center gap-1.5 border-t border-slate-50 pt-4">
                            {subtitle}
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-none p-4 rounded-xl">
                    <p className="text-xs font-medium">{qualiopi}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function FunnelStep({ label, value, total, color }: any) {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-black text-slate-900 uppercase tracking-wider">{label}</span>
                <span className="text-lg font-black text-slate-900">{value} <span className="text-slate-300 text-sm">/ {total}</span></span>
            </div>
            <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-lg shadow-current/20", color)}
                />
            </div>
        </div>
    )
}
