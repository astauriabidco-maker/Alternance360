
'use client'

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { updateTenant } from "@/app/admin/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function TenantSettingsForm({ tenant }: { tenant: any }) {
    const [loading, setLoading] = useState(false)

    async function clientAction(formData: FormData) {
        setLoading(true)
        const result = await updateTenant(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Paramètres mis à jour avec succès")
        }
    }

    return (
        <form action={clientAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Nom de l'organisme</label>
                    <input
                        name="name"
                        defaultValue={tenant.name}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Couleur Principale (Hex)</label>
                    <div className="flex gap-3">
                        <input
                            type="color"
                            name="primaryColor"
                            defaultValue={tenant.primaryColor || "#4f46e5"}
                            className="h-10 w-20 rounded-md border border-slate-200 cursor-pointer p-1"
                        />
                        <input
                            type="text"
                            defaultValue={tenant.primaryColor || "#4f46e5"}
                            className="flex-1 h-10 px-3 rounded-md border border-slate-200 text-sm bg-slate-50 text-slate-500"
                            readOnly
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 col-span-full pt-4">
                    <h3 className="font-semibold text-slate-900 mb-4">Informations Juridiques & Contact</h3>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Numéro SIRET</label>
                    <input
                        name="siret"
                        defaultValue={tenant.siret || ""}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Email de contact</label>
                    <input
                        type="email"
                        name="contactEmail"
                        defaultValue={tenant.contactEmail || ""}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Téléphone</label>
                    <input
                        name="contactPhone"
                        defaultValue={tenant.contactPhone || ""}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Site Web</label>
                    <input
                        type="url"
                        name="website"
                        defaultValue={tenant.website || ""}
                        placeholder="https://..."
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium text-slate-900">Adresse</label>
                    <textarea
                        name="address"
                        defaultValue={tenant.address || ""}
                        rows={3}
                        className="w-full p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    )
}
