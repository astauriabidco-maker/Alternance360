import { getReportStats } from "@/app/actions/super-admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    BarChart3,
    TrendingUp,
    Users,
    ShieldCheck,
    ArrowUpRight,
    FileDown,
    Calendar,
    MousePointer2,
    Clock,
    Layers,
    Activity,
    PieChart
} from "lucide-react"

export default async function ReportsPage() {
    const stats = await getReportStats()

    const metrics = [
        { label: 'Utilisateurs Actifs', value: stats.totalUsers, change: '+14%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Contrats Signés', value: stats.activeContracts, change: '+8.2%', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Revenus TOTAUX', value: stats.totalRevenue.toLocaleString() + ' €', change: '+22%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Engagement Moyen', value: '78%', change: '+5%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' }
    ]

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                        <BarChart3 size={14} />
                        <span>Advanced Platform Analytics</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Rapports.</h1>
                    <p className="text-slate-500 font-medium text-lg">Analysez la performance globale et la croissance de l'écosystème.</p>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white font-black text-slate-600 shadow-sm transition-all hover:bg-slate-50 gap-2">
                        <Calendar size={18} /> Jan 2026
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black shadow-xl shadow-slate-200 gap-2">
                        <FileDown size={20} /> Exporter PDF
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start relative z-10 mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center`}>
                                <m.icon size={24} />
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">{m.change}</Badge>
                        </div>
                        <div className="text-3xl font-black text-slate-900 relative z-10">{m.value}</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">{m.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-none">Croissance des Contrats</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Volume mensuel sur 12 mois</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="rounded-lg bg-slate-100 font-bold">Hebdomadaire</Button>
                            <Button variant="ghost" size="sm" className="rounded-lg font-bold">Mensuel</Button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center">
                        <div className="text-center">
                            <PieChart size={48} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Visualisation graphique en cours de chargement...</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-black leading-tight mb-4">Focus Qualiopi Platforme</h2>
                        <p className="text-slate-400 font-medium">Taux de conformité moyen sur l'ensemble des tenants actifs.</p>

                        <div className="mt-10 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span>Taux de Signature</span>
                                    <span className="text-blue-400">92%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full w-[92%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span>Preuves Archivées</span>
                                    <span className="text-emerald-400">84%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-[84%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-16 rounded-2xl bg-white text-slate-900 font-black mt-10 hover:bg-slate-50 gap-2">
                        Générer Rapport Compliance <FileDown size={20} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${className}`}>
            {children}
        </span>
    )
}
