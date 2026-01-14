import { getGlobalUsers, getTenants } from "@/app/actions/super-admin"
import { UserTable } from "@/components/super-admin/user-table"
import { Users } from "lucide-react"

export default async function GlobalUsersPage() {
    const users = await getGlobalUsers()
    const tenants = await getTenants()

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                        <Users size={14} />
                        <span>Identity & Access Control</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Utilisateurs.</h1>
                    <p className="text-slate-500 font-medium text-lg">Visualisation globale et gestion proactive de tous les comptes du système.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm">Tous</button>
                    <button className="px-6 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 font-bold text-sm transition-all">Actifs</button>
                    <button className="px-6 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 font-bold text-sm transition-all">Support</button>
                </div>
            </header>

            <UserTable initialUsers={users} tenants={tenants} />
        </div>
    )
}
