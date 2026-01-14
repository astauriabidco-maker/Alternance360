"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users,
    Mail,
    ShieldCheck,
    Building2,
    GraduationCap,
    Briefcase,
    Search,
    UserCircle2,
    Calendar,
    MoreHorizontal,
    Edit3,
    VenetianMask
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { UserEditModal } from "./user-edit-modal"
import { toast } from "sonner"

interface UserTableProps {
    initialUsers: any[]
    tenants: any[]
}

export function UserTable({ initialUsers, tenants }: UserTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filteredUsers = initialUsers.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin': return <Badge className="bg-amber-50 text-amber-700 border-amber-100 gap-1 rounded-lg py-1 px-3"><ShieldCheck size={12} /> Super Admin</Badge>
            case 'admin': return <Badge className="bg-rose-50 text-rose-700 border-rose-100 gap-1 rounded-lg py-1 px-3"><ShieldCheck size={12} /> Admin CFA</Badge>
            case 'formateur': return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 gap-1 rounded-lg py-1 px-3"><Briefcase size={12} /> Formateur</Badge>
            case 'tutor': return <Badge className="bg-blue-50 text-blue-700 border-blue-100 gap-1 rounded-lg py-1 px-3"><Building2 size={12} /> Tuteur</Badge>
            default: return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-1 rounded-lg py-1 px-3"><GraduationCap size={12} /> Apprenti</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, rôle ou CFA..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-8">Profil Utilisateur</th>
                            <th className="p-8">Rôle Platform</th>
                            <th className="p-8">Instance (Tenant)</th>
                            <th className="p-8">Inscription</th>
                            <th className="p-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user: any) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                                                <UserCircle2 size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 text-base">{user.fullName || 'Utilisateur sans nom'}</div>
                                                <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={12} className="text-slate-300" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="font-bold text-slate-700">{user.tenant?.name || 'Système Central'}</span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{user.tenantId || 'GLOBAL'}</div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                                            <Calendar size={14} className="text-slate-300" />
                                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={async () => {
                                                    if (confirm(`Se connecter en tant que ${user.fullName} ?`)) {
                                                        const { startImpersonation } = await import('@/app/actions/impersonation')
                                                        try {
                                                            await startImpersonation(user.id)
                                                            toast.success(`Connexion en tant que ${user.fullName}`)
                                                        } catch (e) {
                                                            toast.error("Erreur d'impersonnation")
                                                        }
                                                    }
                                                }}
                                                className="h-10 px-4 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 font-bold transition-all gap-2"
                                                title="Se connecter en tant que..."
                                            >
                                                <VenetianMask size={16} />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setIsModalOpen(true)
                                                }}
                                                className="h-10 px-4 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 font-bold transition-all flex items-center gap-2"
                                            >
                                                <Edit3 size={16} /> Modifier
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserEditModal
                    user={selectedUser}
                    tenants={tenants}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedUser(null)
                    }}
                />
            )}
        </div>
    )
}
