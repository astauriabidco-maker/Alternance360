import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateTenantCompliance, createTenantGlobal } from "@/app/actions/super-admin"
import { toast } from "sonner"
import { Building2, Save, X, Palette, Image as ImageIcon } from "lucide-react"

interface TenantEditModalProps {
    tenant?: any
    isOpen: boolean
    onClose: () => void
}

export function TenantEditModal({ tenant, isOpen, onClose }: TenantEditModalProps) {
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        primaryColor: "#4f46e5",
        siret: "",
        address: "",
        ndaNumber: "",
        uaiCode: "",
        legalRep: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        qualiopiCert: false
    })

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: tenant?.name || "",
                primaryColor: tenant?.primaryColor || "#4f46e5",
                siret: tenant?.siret || "",
                address: tenant?.address || "",
                ndaNumber: tenant?.ndaNumber || "",
                uaiCode: tenant?.uaiCode || "",
                legalRep: tenant?.legalRep || "",
                contactEmail: tenant?.contactEmail || "",
                contactPhone: tenant?.contactPhone || "",
                website: tenant?.website || "",
                qualiopiCert: tenant?.qualiopiCert || false
            })
            setLogoFile(null)
        }
    }, [tenant, isOpen])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const data = new FormData()
            if (tenant?.id) {
                data.append("tenantId", tenant.id)
            }

            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key])
            })

            if (logoFile) {
                data.append("logo", logoFile)
            }

            const result = tenant?.id
                ? await updateTenantCompliance(data)
                : await createTenantGlobal(data)

            if (result.success) {
                toast.success(tenant ? "Instance mise à jour" : "Nouvelle instance créée")
                onClose()
            } else {
                toast.error("Erreur: " + ((result as any).error || "Opération échouée"))
            }
        } catch (error) {
            toast.error("Erreur serveur")
        } finally {
            setIsSaving(false)
        }
    }

    // if (!tenant) return null // REMOVED to support creation

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-y-auto max-h-[90vh] border-none rounded-[2rem] shadow-2xl">
                <div className="bg-slate-900 p-8 text-white relative sticky top-0 z-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                            {tenant ? "Branding & Conformité." : "Nouveau Partenaire."}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            {tenant ? `Configuration pour ${tenant.name}` : "Initialisation d'une nouvelle instance CFA."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={onClose}>
                        <X size={24} />
                    </div>
                </div>

                <div className="p-8 space-y-8 bg-white">
                    {/* Branding Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b pb-2">Identité Visuelle</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de l'Etablissement</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Couleur (HEX)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        className="h-12 rounded-xl bg-slate-50 font-mono"
                                    />
                                    <input
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                        className="w-12 h-12 rounded-xl cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logo (Recommandé: PNG transparent)</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                                    className="h-12 pt-3 rounded-xl bg-slate-50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Legal Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b pb-2">Informations Légales</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SIRET (14 chiffres)</Label>
                                <Input
                                    value={formData.siret}
                                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                    placeholder="123 456 789 00012"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code UAI</Label>
                                <Input
                                    value={formData.uaiCode}
                                    onChange={(e) => setFormData({ ...formData, uaiCode: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                    placeholder="075XXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Numéro Déclaration (NDA)</Label>
                                <Input
                                    value={formData.ndaNumber}
                                    onChange={(e) => setFormData({ ...formData, ndaNumber: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                />
                            </div>
                            <div className="space-y-2 flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="qualiopi"
                                    checked={formData.qualiopiCert}
                                    onChange={(e) => setFormData({ ...formData, qualiopiCert: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor="qualiopi" className="text-sm font-bold text-slate-700">Certifié Qualiopi ?</Label>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse Siège Social</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b pb-2">Représentant Légal & Contact</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom du Représentant Légal</Label>
                                <Input
                                    value={formData.legalRep}
                                    onChange={(e) => setFormData({ ...formData, legalRep: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                    placeholder="M. Jean Dupont"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Administratif</Label>
                                <Input
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone</Label>
                                <Input
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-8 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
                    <Button
                        variant="outline"
                        className="h-12 px-6 rounded-xl border-slate-200 font-bold"
                        onClick={onClose}
                    >
                        Annuler
                    </Button>
                    <Button
                        className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-black gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <Save size={18} /> {isSaving ? "Enregistrement..." : "Appliquer & Mettre à jour"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
