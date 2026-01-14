
import { auth } from "@/auth"
import db from "@/lib/db"
import { redirect } from "next/navigation"
import { TenantSettingsForm } from "@/components/admin/settings/tenant-settings-form"

export default async function SettingsPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true, role: true }
    })

    if (!user || user.role !== "admin") {
        return <div className="p-8">Accès non autorisé</div>
    }

    const tenant = await db.tenant.findUnique({
        where: { id: user.tenantId! }
    })

    if (!tenant) return <div className="p-8">Organisme introuvable</div>

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuration</h1>
                <p className="text-slate-500">Gérez les informations de votre organisme de formation.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <TenantSettingsForm tenant={tenant} />
            </div>
        </div>
    )
}
