import { getSubscriptions } from "@/app/actions/super-admin"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    Calendar,
    DollarSign,
    Receipt,
    Building2,
    Eye,
    Plus,
    Filter,
    ArrowDownRight
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default async function BillingPage() {
    const subscriptions = await getSubscriptions()

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                        <DollarSign size={14} />
                        <span>Financial Operations</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Facturation.</h1>
                    <p className="text-slate-500 font-medium text-lg">Suivi des revenus, abonnements et factures clients.</p>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white font-black text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                        Rapports Revenus
                    </Button>
                    <Button className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black shadow-xl shadow-emerald-500/20 gap-2">
                        <TrendingUp size={18} /> Optimiser Plans
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">+18%</Badge>
                    </div>
                    <div className="text-3xl font-black text-slate-900">12,450 €</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">MRR (Monthly Recurring Revenue)</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                            <Receipt size={24} />
                        </div>
                        <Badge className="bg-rose-50 text-rose-700 border-rose-100">4 En retard</Badge>
                    </div>
                    <div className="text-3xl font-black text-slate-900">850 €</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Impayés</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">24</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Abonnements Actifs</div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-900">
                        <CreditCard size={20} className="text-slate-400" />
                        <span className="font-black uppercase tracking-widest text-xs">Gestion des Abonnements CFA</span>
                    </div>
                    <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                        Voir tout l'historique
                    </Button>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-8">CFA (Tenant)</th>
                            <th className="p-8">Plan</th>
                            <th className="p-8">État</th>
                            <th className="p-8">Renouvellement</th>
                            <th className="p-8">Dernière Facture</th>
                            <th className="p-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {subscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <Building2 size={48} className="text-slate-100 mb-4" />
                                        <p className="text-slate-400 font-bold">Aucun abonnement configuré</p>
                                        <Button className="mt-4 bg-slate-900 rounded-xl">Lancer un test de facturation</Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            subscriptions.map((sub: any) => (
                                <tr key={sub.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                                                {sub.tenant.name.substring(0, 1)}
                                            </div>
                                            <div className="font-black text-slate-900">{sub.tenant.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <Badge className={`rounded-lg py-1 px-3 border-0 font-black ${sub.plan === 'ENTERPRISE' ? 'bg-indigo-600 text-white' :
                                                sub.plan === 'PRO' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {sub.plan}
                                        </Badge>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${sub.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                            <span className="font-bold text-slate-700">{sub.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-8 font-bold text-slate-500">
                                        {sub.endDate ? format(new Date(sub.endDate), 'dd MMM yyyy', { locale: fr }) : 'A vie'}
                                    </td>
                                    <td className="p-8">
                                        <div className="text-slate-900 font-black">{sub.invoices[0]?.amount.toLocaleString()} €</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">le {format(new Date(sub.invoices[0]?.createdAt), 'dd/MM/yyyy')}</div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                                            <Eye size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
