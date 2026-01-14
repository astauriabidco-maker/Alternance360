"use client"

import { Button } from "@/components/ui/button"
import { VenetianMask, X } from "lucide-react"
import { stopImpersonation } from "@/app/actions/impersonation"
import { toast } from "sonner"

interface ImpersonationBannerProps {
    originalUserId?: string
}

export function ImpersonationBanner({ originalUserId }: ImpersonationBannerProps) {
    if (!originalUserId) return null

    const handleStop = async () => {
        try {
            await stopImpersonation()
            toast.success("Retour à votre compte administrateur")
            // Windows location reload to clear any client states
            window.location.href = '/'
        } catch (error) {
            toast.error("Erreur lors de la déconnexion")
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-amber-950 text-amber-50 rounded-2xl p-2 pl-5 shadow-2xl flex items-center gap-4 border border-amber-800/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                        <VenetianMask size={16} className="text-amber-400" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-amber-400">Mode Espion Actif</div>
                        <div className="text-[10px] font-medium leading-tight">Vous êtes connecté en tant qu'un autre utilisateur.</div>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStop}
                    className="h-10 px-4 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white border-none shadow-lg shadow-amber-900/20"
                >
                    <X size={16} className="mr-2" /> Arrêter
                </Button>
            </div>
        </div>
    )
}
