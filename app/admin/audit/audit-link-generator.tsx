'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createAuditSession } from '@/app/actions/audit'
import { Link2, Copy, CheckCircle, Users, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type Apprentice = { id: string; fullName: string | null; email: string }

export function AuditLinkGenerator({ apprentices }: { apprentices: Apprentice[] }) {
    const [selected, setSelected] = useState<string[]>([])
    const [days, setDays] = useState(2)
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const toggleSelection = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleGenerate = async () => {
        if (selected.length === 0) {
            toast.error("Veuillez sélectionner au moins un apprenti.")
            return
        }
        setIsLoading(true)
        try {
            const result = await createAuditSession(selected, days)
            setGeneratedUrl(`${window.location.origin}${result.url}`)
            toast.success("Lien d'audit généré avec succès !")
        } catch (e: any) {
            toast.error(e.message || "Erreur lors de la génération du lien.")
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (generatedUrl) {
            navigator.clipboard.writeText(generatedUrl)
            toast.success("Lien copié !")
        }
    }

    return (
        <Card className="bg-white border-slate-200 shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Sélection de l'échantillon</CardTitle>
                        <CardDescription>Choisissez les apprentis dont les dossiers seront accessibles à l'auditeur.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Apprentice List */}
                <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                    {apprentices.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">Aucun apprenti trouvé.</p>
                    ) : (
                        apprentices.map(a => (
                            <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors">
                                <Checkbox
                                    id={a.id}
                                    checked={selected.includes(a.id)}
                                    onCheckedChange={() => toggleSelection(a.id)}
                                    className="data-[state=checked]:bg-indigo-600 border-slate-300"
                                />
                                <label htmlFor={a.id} className="text-sm font-medium text-slate-700 cursor-pointer flex-1">{a.fullName || a.email}</label>
                            </div>
                        ))
                    )}
                </div>

                {/* Validity & Generate */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 grid gap-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Validité (jours)</label>
                        <Input
                            type="number"
                            value={days}
                            onChange={e => setDays(Number(e.target.value))}
                            min={1} max={7}
                            className="w-24 font-bold text-center"
                        />
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || selected.length === 0}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 px-6"
                    >
                        <Link2 size={18} /> {isLoading ? 'Génération...' : 'Générer le Lien'}
                    </Button>
                </div>

                {/* Generated Link Output */}
                {generatedUrl && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
                        <CheckCircle className="text-emerald-600 shrink-0" size={24} />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Lien sécurisé prêt</p>
                            <p className="text-sm font-mono text-emerald-700 truncate">{generatedUrl}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0 font-bold gap-2">
                            <Copy size={14} /> Copier
                        </Button>
                    </div>
                )}

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>Ce lien permet un accès en lecture seule aux données des apprentis sélectionnés. Toutes les consultations seront enregistrées.</p>
                </div>
            </CardContent>
        </Card>
    )
}
