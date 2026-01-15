import { getGlobalStats } from "@/app/actions/super-admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/components/ui/button"
import {
    Building2,
    Users,
    Inbox,
    ShieldCheck,
    ArrowUpRight,
    TrendingUp,
    Globe,
    Activity,
    BookOpen,
    CreditCard
} from "lucide-react"

import { RevenueChart } from '@/components/super-admin/charts/revenue-chart'
import { TenantGrowthChart } from '@/components/super-admin/charts/tenant-growth-chart'
import { PlanDistributionChart } from '@/components/super-admin/charts/plan-distribution-chart'

export default async function SuperAdminDashboard() {
    const stats = await getGlobalStats()

    const kpis = [
        {
            label: 'Total Tenants',
            value: stats.tenantCount,
            description: 'CFA enregistrés',
            icon: Building2,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Utilisateurs',
            value: stats.userCount,
            description: 'Tous rôles confondus',
            icon: Users,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Leads Actifs',
            value: stats.activeLeads,
            description: 'Demandes à traiter',
            icon: Inbox,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            label: 'Contrats',
            value: stats.contractCount,
            description: 'Générés sur la plateforme',
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        }
    ]

    return (
        <div className="space-y-12">
            <header>
                <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                    <Globe size={16} fill="currentColor" />
                    <span>Cross-Tenant Control Center</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">Dashboard.</h1>
                <p className="text-slate-500 font-medium text-xl">Surveillance globale et gestion de l'écosystème Alternance 360.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
                                <kpi.icon size={28} />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1">{kpi.value}</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</div>
                        <p className="text-xs text-slate-500 font-medium">{kpi.description}</p>
                    </div>
                ))}
            </div>

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Évolution du Chiffre d'Affaires</h3>
                            <p className="text-sm text-slate-500 font-medium">Revenu récurrent mensuel (MRR) sur l'année</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">2026</span>
                        </div>
                    </div>
                    <RevenueChart />
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-lg font-black text-slate-900 mb-4">Acquisition Tenants</h3>
                        <TenantGrowthChart />
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-lg font-black text-slate-900 mb-4">Plans Distribution</h3>
                        <PlanDistributionChart />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <TrendingUp size={200} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Santé du Système</h2>
                        <p className="text-slate-500 font-medium mb-8">Statut des services et utilisation des ressources.</p>

                        <div className="space-y-6">
                            {[
                                { label: 'Base de données', status: 'Optimal', health: 98, color: 'bg-emerald-500' },
                                { label: 'Stockage (S3/Supabase)', status: 'Opérationnel', health: 92, color: 'bg-blue-500' },
                                { label: 'API Gateway', status: 'Stable', health: 100, color: 'bg-indigo-500' },
                            ].map((service) => (
                                <div key={service.label}>
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-wider">{service.label}</span>
                                            <span className="ml-3 text-xs font-bold text-slate-400 italic">{service.status}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{service.health}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", service.color)} style={{ width: `${service.health}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/20">
                            <BookOpen size={32} />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Référentiels RNCP</h2>
                        <p className="text-slate-400 font-medium mb-8">Nombre total de masters actifs.</p>
                        <div className="text-6xl font-black mb-8">{stats.referentielCount}</div>
                        <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all active:scale-[0.98]">
                            Gérer la bibliothèque
                        </button>
                    </div>
                    <div className="absolute bottom-0 right-0 p-4 opacity-10">
                        <ShieldCheck size={120} />
                    </div>
                </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 pb-12">
                <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        Alertes Financières <CreditCard size={20} className="text-rose-500" />
                    </h2>
                    <div className="space-y-4">
                        {[
                            { tenant: 'CFA Alpha', msg: 'Paiement échoué (Plan Pro)', date: 'Il y a 2h', type: 'error' },
                            { tenant: 'CFA Beta', msg: 'Abonnement expire bientôt', date: 'Demain', type: 'warning' },
                        ].map((alert, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className={`w-2 rounded-full ${alert.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                                <div>
                                    <div className="text-sm font-black text-slate-900">{alert.tenant}</div>
                                    <div className="text-xs text-slate-500 font-medium">{alert.msg}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{alert.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm overflow-hidden relative">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        Derniers Déploiements <ShieldCheck size={20} className="text-emerald-500" />
                    </h2>
                    <table className="w-full text-sm">
                        <thead className="text-slate-400 font-black uppercase tracking-widest text-[10px] text-left">
                            <tr>
                                <th className="pb-4">Tenant</th>
                                <th className="pb-4">Statut</th>
                                <th className="pb-4">Utilisateurs</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[1, 2, 3].map((_, i) => (
                                <tr key={i} className="group">
                                    <td className="py-4 font-bold text-slate-900">Instance Prototype {i + 1}</td>
                                    <td className="py-4">
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Actif</Badge>
                                    </td>
                                    <td className="py-4 font-bold text-slate-400">12</td>
                                    <td className="py-4 text-right">
                                        <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Accéder</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", className)}>
            {children}
        </span>
    )
}
