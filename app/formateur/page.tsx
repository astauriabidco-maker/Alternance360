import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BarChart3, Users, AlertCircle, FileText, TrendingUp, Search } from "lucide-react"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function FormateurDashboard() {
    const session = await auth()

    if (!session) redirect("/login")
    if (!["formateur", "admin", "super_admin"].includes(session.user.role)) redirect("/login")

    return (
        <div className="min-h-screen bg-slate-50/50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center"><BarChart3 size={18} /></div>
                    <span className="text-lg font-black tracking-tight">CFA Central</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Navigation</div>
                    {[
                        { label: 'Tableau de bord', icon: BarChart3, active: true },
                        { label: 'Apprentis', icon: Users },
                        { label: 'Ingénierie RNCP', icon: FileText },
                        { label: 'Alertes Audit', icon: AlertCircle }
                    ].map((item, i) => (
                        <a key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${item.active ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}>
                            <item.icon size={20} />
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <SignOutButton className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Vue d'ensemble CFA 🏟️</h1>
                        <p className="text-slate-500">Santé globale de votre flotte d'apprentissage.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-900/5 transition-all text-sm" placeholder="Rechercher un apprenti..." />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                    </div>
                </header>

                {/* KPIs */}
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Apprentis Actifs', val: '142', change: '+12%', icon: Users, color: 'text-blue-600' },
                        { label: 'Conformité Qualiopi', val: '98%', change: '+3%', icon: ShieldCheck, color: 'text-emerald-600' },
                        { label: 'Alerte Rupture', val: '04', change: '-2', icon: AlertCircle, color: 'text-rose-600' },
                        { label: 'Livrables Prêts', val: '86', change: '+08', icon: FileText, color: 'text-indigo-600' }
                    ].map((kpi, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl bg-slate-50 ${kpi.color}`}><kpi.icon size={20} /></div>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{kpi.change}</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{kpi.val}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</div>
                        </div>
                    ))}
                </div>

                {/* Real-time Fleet Activity */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Alertes Prioritaires</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100/50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                        <div>
                                            <div className="text-sm font-bold text-rose-900">Rupture imminente - Thomas Wagner</div>
                                            <div className="text-xs text-rose-700/70">Dernière visite tutorale il y a +45 jours</div>
                                        </div>
                                    </div>
                                    <button className="text-xs font-black text-rose-700 uppercase tracking-widest hover:underline">Intervenir</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Suivi des Compétences</h3>
                            <TrendingUp className="text-emerald-500" size={20} />
                        </div>
                        <div className="space-y-6">
                            <div className="h-48 flex items-end justify-between gap-2 px-4">
                                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                    <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all duration-1000 group-hover:bg-blue-400" style={{ height: `${h}%` }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                <span>Lundi</span>
                                <span>Dimanche</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
