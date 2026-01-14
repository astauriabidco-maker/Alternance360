"use client"

import { useState } from "react"
import { uploadProof } from "@/app/actions/proofs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, Upload, CheckCircle2, AlertCircle } from "lucide-react"

interface ProofUploadFormProps {
    competences: { id: string, description: string }[]
    onSuccess?: () => void
}

export function ProofUploadForm({ competences, onSuccess }: ProofUploadFormProps) {
    const [selectedCompId, setSelectedCompId] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [comment, setComment] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !selectedCompId) return

        setIsUploading(true)
        setStatus(null)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('competenceId', selectedCompId)
        formData.append('comment', comment)

        const result = await uploadProof(formData)

        if (result.success) {
            setStatus({ type: 'success', message: 'Preuve envoyée avec succès !' })
            setFile(null)
            setComment("")
            setSelectedCompId("")
            onSuccess?.()
        } else {
            setStatus({ type: 'error', message: result.error || "Une erreur est survenue lors de l'envoi." })
        }
        setIsUploading(false)
    }

    return (
        <Card className="w-full max-w-lg mx-auto overflow-hidden border-2 border-blue-50">
            <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Camera className="w-5 h-5" />
                    Ajouter une Preuve
                </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                    {/* Competence Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Compétence visée</label>
                        <select
                            className="w-full p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={selectedCompId}
                            onChange={(e) => setSelectedCompId(e.target.value)}
                            required
                        >
                            <option value="">-- Sélectionner --</option>
                            {competences.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.description.length > 60 ? c.description.substring(0, 60) + '...' : c.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Document / Photo</label>
                        <div className={`
                            relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all
                            ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}
                        `}>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                required
                            />
                            {file ? (
                                <div className="text-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-green-700 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Cliquez ou déposez votre fichier</p>
                                    <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Démarche / Contexte (Optionnel)</label>
                        <textarea
                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                            placeholder="Décrivez ce que vous avez réalisé..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Feedback Status */}
                    {status && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <p className="text-sm">{status.message}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-gray-50 border-t p-4">
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                        disabled={isUploading || !file || !selectedCompId}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            'Envoyer la Preuve'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
