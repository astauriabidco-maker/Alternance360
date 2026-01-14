"use client"

import { useRef } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, PenTool } from "lucide-react"

interface SignaturePadProps {
    onSave: (signatureData: string) => void
}

export function SignaturePad({ onSave }: SignaturePadProps) {
    const sigPad = useRef<SignatureCanvas | null>(null)

    const clear = () => sigPad.current?.clear()
    const save = () => {
        if (sigPad.current?.isEmpty()) return;
        const data = sigPad.current?.getTrimmedCanvas().toDataURL('image/png')
        if (data) onSave(data)
    }

    return (
        <Card className="border-2 border-gray-100 shadow-none bg-gray-50/50">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase text-gray-500 flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> Signature Tactile
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clear} className="text-xs h-8">
                    <RotateCcw className="w-3 h-3 mr-1" /> Effacer
                </Button>
            </CardHeader>
            <CardContent className="p-4">
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 overflow-hidden h-40">
                    <SignatureCanvas
                        ref={(ref) => { sigPad.current = ref }}
                        penColor="black"
                        canvasProps={{ className: "signature-canvas w-full h-full" }}
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                    Utilisez votre doigt ou un stylet pour signer ci-dessus
                </p>
                <Button
                    onClick={save}
                    className="w-full mt-4 bg-gray-900 text-white font-bold h-10 rounded-xl"
                >
                    Valider le Bilan
                </Button>
            </CardContent>
        </Card>
    )
}
