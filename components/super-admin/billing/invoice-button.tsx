"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { generateInvoicePDF } from "@/lib/invoice-generator"
import { useState } from "react"
import { toast } from "sonner"

interface InvoiceButtonProps {
    invoice: any
    tenant: any
    plan: string
}

export function InvoiceButton({ invoice, tenant, plan }: InvoiceButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownload = async () => {
        setLoading(true)
        try {
            await generateInvoicePDF({
                invoiceNumber: invoice.id.substring(0, 8).toUpperCase(),
                date: new Date(invoice.createdAt),
                tenantName: tenant.name,
                tenantAddress: tenant.address || 'Adresse non renseignée',
                amount: invoice.amount,
                planName: plan
            })
            toast.success("Facture téléchargée")
        } catch (error) {
            console.error(error)
            toast.error("Erreur de génération")
        } finally {
            setLoading(false)
        }
    }

    if (!invoice) return <span className="text-slate-300">-</span>

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={loading}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            title="Télécharger la facture"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        </Button>
    )
}
