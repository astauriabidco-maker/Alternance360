"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateGlobalUser, deleteUserGlobal } from "@/app/actions/super-admin"
import { toast } from "sonner"
import { ShieldAlert, Trash2, Save, X } from "lucide-react"

interface UserEditModalProps {
    user: any
    isOpen: boolean
    onClose: () => void
    tenants: any[]
}

export function UserEditModal({ user, isOpen, onClose, tenants }: UserEditModalProps) {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        role: user?.role || "apprentice",
        tenantId: user?.tenantId || ""
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateGlobalUser(user.id, formData)
            if (result.success) {
                toast.success("Utilisateur mis à jour avec succès")
                onClose()
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return

        setIsDeleting(true)
        try {
            const result = await deleteUserGlobal(user.id)
            if (result.success) {
                toast.success("Utilisateur supprimé")
                onClose()
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression")
        } finally {
            setIsDeleting(false)
        }
    }

    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                <div className="bg-slate-900 p-8 text-white relative">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Modifier l'accès.</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            Gestion des privilèges et du rattachement CFA pour {user.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={onClose}>
                        <X size={24} />
                    </div>
                </div>

                <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom Complet</Label>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Platforme</Label>
                        <Input
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rôle Attribué</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v) => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold">
                                    <SelectValue placeholder="Choisir un rôle" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="admin">Admin CFA</SelectItem>
                                    <SelectItem value="formateur">Formateur</SelectItem>
                                    <SelectItem value="tutor">Tuteur</SelectItem>
                                    <SelectItem value="apprentice">Apprenti</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CFA de rattachement</Label>
                            <Select
                                value={formData.tenantId || "global"}
                                onValueChange={(v) => setFormData({ ...formData, tenantId: v === "global" ? null : v })}
                            >
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold">
                                    <SelectValue placeholder="Choisir un CFA" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="global">Système Central</SelectItem>
                                    {tenants.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {formData.role === 'super_admin' && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                            <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                            <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed tracking-tight">
                                Attention : Le rôle Super Admin donne un contrôle total sur l'ensemble de la plateforme et de toutes les instances CFA.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 flex items-center justify-between gap-4 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        className="h-12 px-6 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold transition-all gap-2"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 size={18} /> Supprimer
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-slate-200 font-bold"
                            onClick={onClose}
                        >
                            Annuler
                        </Button>
                        <Button
                            className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 font-black gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={18} /> {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
