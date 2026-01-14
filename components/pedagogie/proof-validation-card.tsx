"use client"

import { useState } from "react"
import { validateProof } from "@/app/actions/validate-proof"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, MessageSquare, ExternalLink, Loader2 } from "lucide-react"

interface ProofRequest {
    id: string
    user_name: string
    competence_description: string
    url: string
    type: 'IMG' | 'PDF'
    comment?: string
    created_at: string
}

export function ProofValidationCard({ proof }: { proof: ProofRequest }) {
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDone, setIsDone] = useState(false)

    const handleAction = async (status: 'VALIDATED' | 'REJECTED') => {
        setIsSubmitting(true)
        const res = await validateProof(proof.id, status, comment)
        if (res.success) {
            setIsDone(true)
        }
        setIsSubmitting(false)
    }

    if (isDone) return null // Hide once validated in demo

    return (
        <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="bg-gray-50/80 border-b py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">{proof.user_name}</Badge>
                        <span className="text-xs text-gray-400">il y a 2h</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">À Valider</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Compétence</h4>
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                        {proof.competence_description}
                    </p>
                </div>

                {proof.comment && (
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 italic">"{proof.comment}"</p>
                    </div>
                )}

                {/* File Preview Placeholder */}
                <div className="aspect-[4/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <ExternalLink className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Voir le document ({proof.type})</span>
                </div>

                <textarea
                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none bg-gray-50"
                    placeholder="Ajouter un commentaire de feedback..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </CardContent>
            <CardFooter className="bg-gray-50/80 border-t p-2 grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    className="h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                    onClick={() => handleAction('REJECTED')}
                    disabled={isSubmitting}
                >
                    <X className="w-4 h-4 mr-2" /> Refuser
                </Button>
                <Button
                    className="h-10 bg-green-600 hover:bg-green-700 text-white font-bold"
                    onClick={() => handleAction('VALIDATED')}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Valider</>}
                </Button>
            </CardFooter>
        </Card>
    )
}
