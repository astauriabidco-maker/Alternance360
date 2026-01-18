'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateLivretButtonProps {
    contractId: string
    buttonText?: string
    className?: string
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
}

export function GenerateLivretButton({
    contractId,
    buttonText = "Générer Livret PDF",
    className,
    variant = 'primary',
    size = 'md'
}: GenerateLivretButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/livret/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contractId }),
            })

            const data = await response.json()

            if (data.success && data.downloadUrl) {
                toast.success("Le livret a été généré avec succès !")
                window.open(data.downloadUrl, '_blank')
            } else {
                throw new Error(data.error || "Une erreur est survenue lors de la génération.")
            }
        } catch (error: any) {
            console.error("PDF Generation Error:", error)
            toast.error(error.message || "Erreur lors de la génération du PDF.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleGenerate}
            isLoading={loading}
            variant={variant}
            size={size}
            className={className}
        >
            {!loading && <FileText className="mr-2 h-4 w-4" />}
            {loading ? "Génération..." : buttonText}
        </Button>
    )
}
