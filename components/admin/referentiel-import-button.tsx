"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Check } from "lucide-react"
import { importGlobalReferentiel } from "@/app/admin/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ReferentielImportButton({ referentielId, label = "Importer" }: { referentielId: string, label?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()

    const handleImport = async () => {
        setIsLoading(true)
        try {
            const result = await importGlobalReferentiel(referentielId)
            if (result.success) {
                toast.success("Référentiel importé avec succès")
                setIsSuccess(true)
                router.refresh()
            } else {
                toast.error(result.error || "Erreur lors de l'importation")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleImport}
            disabled={isLoading || isSuccess}
            className={`flex-1 rounded-xl h-12 font-bold ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" />
            ) : isSuccess ? (
                <>
                    <Check size={18} className="mr-2" /> Importé
                </>
            ) : (
                <>
                    <Download size={18} className="mr-2" /> {label}
                </>
            )}
        </Button>
    )
}
