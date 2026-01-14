import { getPlatformSettings } from "@/app/actions/super-admin"
import { ConfigManager } from "@/components/super-admin/config-manager"
import { Settings2 } from "lucide-react"

export default async function ConfigPage() {
    const settings = await getPlatformSettings()

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3">
                        <Settings2 size={14} />
                        <span>Platform Operations</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">Configuration.</h1>
                    <p className="text-slate-500 font-medium text-lg">Gérez les paramètres globaux et l'état de la plateforme.</p>
                </div>
            </header>

            <ConfigManager settings={settings} />
        </div>
    )
}
