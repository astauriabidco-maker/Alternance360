import { getLeads } from "@/app/actions/leads"
import { LeadsList } from "@/components/super-admin/leads-list"
import { Zap } from "lucide-react"

export default async function LeadsPage() {
    const leads = await getLeads()

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                        <Zap size={14} fill="currentColor" />
                        <span>Provisioning Engine</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Gestion des Leads.</h1>
                    <p className="text-slate-500 font-medium text-lg">Activez les nouvelles instances de CFA en un clic.</p>
                </div>
            </header>

            <LeadsList leads={leads} />
        </div>
    )
}
