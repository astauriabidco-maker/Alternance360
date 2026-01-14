import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sparkles, Activity, Target, BookOpen } from "lucide-react"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function ApprenticeDashboard() {
    const session = await auth()

    if (!session) redirect("/login")
    if (session.user.role !== "apprentice") redirect("/login")

    return (
        <div className="min-h-screen bg-slate-50/50">
            <nav className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white"><Activity size={20} /></div>
                    <span className="text-xl font-black text-slate-900">Mon Espace Apprenti</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{session.user.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.user.role}</div>
                    </div>
                    <SignOutButton />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold mb-4">
                        <Sparkles size={14} />
                        Objectif Diplôme : 84% de complétion
                    </div>
                    <h1 className="text-4xl font-black text-slate-900">Ravi de vous revoir ! 👋</h1>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Action Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <h2 className="text-3xl font-bold mb-4">Une activité à déclarer ?</h2>
                        <p className="text-blue-100 mb-8 max-w-md">Ajoutez une preuve de compétence aujourd'hui pour valider votre livret d'apprentissage.</p>
                        <button className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
                            Ajouter une activité
                        </button>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <Target className="text-emerald-500" size={24} />
                            Auto-Positionnement
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Management de projet', p: 75, color: 'bg-blue-500' },
                                { label: 'Ingénierie Réseaux', p: 90, color: 'bg-emerald-500' },
                                { label: 'Cybersécurité', p: 45, color: 'bg-amber-500' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className="text-slate-400">{item.p}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.p}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roadmap Sneak Peak */}
                    <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <BookOpen className="text-indigo-600" size={28} />
                                Mon Parcours RNCP
                            </h3>
                            <button className="text-sm font-bold text-blue-600 hover:underline">Voir tout le TSF</button>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors mb-4 border border-slate-100">
                                        {i}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700">Bloc de Compétence #{i}</div>
                                    <div className="text-xs text-slate-500 mt-1">Status: En cours</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
