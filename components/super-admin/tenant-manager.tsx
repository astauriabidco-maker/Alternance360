"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Activity,
    Users,
    Briefcase,
    Globe,
    ExternalLink,
    Edit3,
    ArrowUpRight,
    LayoutGrid,
    List,
    Building2,
    Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TenantEditModal } from "./tenant-edit-modal"

interface TenantManagerProps {
    initialTenants: any[]
}

export function TenantManager({ initialTenants }: TenantManagerProps) {
    const [selectedTenant, setSelectedTenant] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("list")

    const handleCreate = () => {
        setSelectedTenant(null)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4">
                        <Building2 size={16} />
                        <span>Infrastructure Control</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">Instances.</h1>
                    <p className="text-slate-500 font-medium text-lg">Pilotez les déploiements et le branding de vos CFAs partenaires.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 h-16 px-2">
                        <Button
                            variant="ghost"
                            className={cn(
                                "h-12 w-12 rounded-lg transition-all",
                                viewMode === "grid" ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-900"
                            )}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid size={24} />
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "h-12 w-12 rounded-lg transition-all",
                                viewMode === "list" ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-900"
                            )}
                            onClick={() => setViewMode("list")}
                        >
                            <List size={24} />
                        </Button>
                    </div>

                    <Button
                        onClick={handleCreate}
                        className="h-16 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg gap-3 shadow-xl shadow-slate-200 active:scale-95 transition-all"
                    >
                        <Plus size={24} /> Nouveau CFA
                    </Button>
                </div>
            </header>

            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {initialTenants.map((tenant: any) => (
                        <div
                            key={tenant.id}
                            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                        >
                            {/* Decorative Background Element */}
                            <div
                                className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700"
                                style={{ backgroundColor: tenant.primaryColor }}
                            />

                            <div className="flex items-start justify-between mb-8 relative">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-[1.5rem] shadow-inner flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform"
                                        style={{ backgroundColor: tenant.primaryColor }}
                                    >
                                        <Globe size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{tenant.name}</h3>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">ID: {tenant.id.split('-')[0]}</div>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 py-1 rounded-full">Actif</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 relative">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Users size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Utilisateurs</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900">{tenant._count?.users || 0}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Briefcase size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Contrats</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900">{tenant._count?.contracts || 0}</div>
                                </div>
                            </div>

                            <div className="flex gap-3 relative">
                                <Button
                                    className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 shadow-lg shadow-slate-200 active:scale-95 transition-all"
                                    onClick={() => {
                                        setSelectedTenant(tenant)
                                        setIsModalOpen(true)
                                    }}
                                >
                                    <Edit3 size={18} /> Gérer
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-12 h-12 p-0 rounded-xl border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all group/btn"
                                >
                                    <ArrowUpRight size={20} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </Button>
                            </div>

                            {/* Progress Indicator (Dummy for visual flair) */}
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative">
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-blue-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Santé Système</span>
                                </div>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="w-[98%] h-full bg-blue-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 divide-y divide-slate-100">
                    <div className="grid grid-cols-12 gap-4 p-6 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-t-[2rem]">
                        <div className="col-span-4">Etablissement</div>
                        <div className="col-span-2 text-center">Utilisateurs</div>
                        <div className="col-span-2 text-center">Contrats</div>
                        <div className="col-span-2 text-center">Statut</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {initialTenants.map((tenant: any) => (
                        <div key={tenant.id} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl shadow-inner flex items-center justify-center text-white shrink-0"
                                    style={{ backgroundColor: tenant.primaryColor }}
                                >
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">{tenant.name}</h3>
                                    <div className="text-[10px] font-mono text-slate-400">{tenant.id.split('-')[0]}</div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center font-bold text-slate-700">{tenant._count?.users || 0}</div>
                            <div className="col-span-2 text-center font-bold text-slate-700">{tenant._count?.contracts || 0}</div>
                            <div className="col-span-2 text-center">
                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 py-1 rounded-full">Actif</Badge>
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-4 gap-2"
                                    onClick={() => {
                                        setSelectedTenant(tenant)
                                        setIsModalOpen(true)
                                    }}
                                >
                                    <Edit3 size={14} /> Gérer
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TenantEditModal
                tenant={selectedTenant}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedTenant(null)
                }}
            />
        </div>
    )
}
