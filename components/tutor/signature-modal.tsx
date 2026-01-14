'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PenTool, Loader2 } from 'lucide-react'
import { SignatureCanvas } from '@/components/ui/signature-canvas'
import { uploadSignature } from '@/app/tutor/actions'
import { useToast } from '@/hooks/use-toast'

export function SignatureModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSave = async (blob: Blob) => {
        setLoading(true)
        const formData = new FormData()
        // Convert Blob to File
        const file = new File([blob], "signature.png", { type: "image/png" })
        formData.append('signature', file)

        const res = await uploadSignature(formData)
        setLoading(false)

        if (res?.success) {
            setOpen(false)
            toast({
                title: "Bilan signé !",
                description: "La signature a été enregistrée avec succès.",
                variant: "default",
                className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            })
        } else {
            toast({
                title: "Erreur",
                description: "Impossible d'enregistrer la signature.",
                variant: "destructive"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                    <PenTool className="mr-2 h-5 w-5" />
                    Signer le Bilan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900 text-center">
                        Signature du Bilan
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="h-[200px] flex flex-col items-center justify-center text-indigo-600">
                            <Loader2 className="h-10 w-10 animate-spin mb-4" />
                            <p className="font-bold">Enregistrement...</p>
                        </div>
                    ) : (
                        <SignatureCanvas onSave={handleSave} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
