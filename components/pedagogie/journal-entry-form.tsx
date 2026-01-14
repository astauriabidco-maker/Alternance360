"use client"

import { useState, useEffect } from "react"
import { syncService } from "@/lib/sync-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Wrench, Lightbulb, AlertTriangle, Send, Wifi, WifiOff, Plus, X } from "lucide-react"

interface JournalFormProps {
    competences: { id: string, description: string }[]
}

export function JournalEntryForm({ competences }: JournalFormProps) {
    const [isOnline, setIsOnline] = useState(true)
    const [pendingCount, setPendingCount] = useState(0)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        titre: "",
        description: "",
        outils: [] as string[],
        reflexion_appris: "",
        reflexion_difficultes: "",
        competences: [] as string[]
    })
    const [currentOutil, setCurrentOutil] = useState("")

    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const [formKey, setFormKey] = useState(0) // Used to reset uncontrolled inputs like File
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle')

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const updateStatus = () => {
            const online = navigator.onLine
            setIsOnline(online)
            if (online && syncService) {
                syncService.sync()
            }
        }

        window.addEventListener('online', updateStatus)
        window.addEventListener('offline', updateStatus)

        let unsubscribe: (() => void) | undefined;

        const checkPending = async () => {
            if (syncService) {
                const count = await syncService.getPendingCount()
                setPendingCount(count)

                unsubscribe = syncService.subscribe(async () => {
                    if (syncService) {
                        const updatedCount = await syncService.getPendingCount()
                        setPendingCount(updatedCount)
                    }
                })
            }
        }
        checkPending()

        return () => {
            window.removeEventListener('online', updateStatus)
            window.removeEventListener('offline', updateStatus)
            if (unsubscribe) unsubscribe()
        }
    }, [])

    const handleAddOutil = () => {
        if (currentOutil.trim()) {
            setFormData(prev => ({ ...prev, outils: [...prev.outils, currentOutil.trim()] }))
            setCurrentOutil("")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (syncService) {
            await syncService.queueEntry(formData, selectedFile)

            // Success Feedback
            setSubmitStatus('success')
            setTimeout(() => setSubmitStatus('idle'), 3000)

            // Reset Form properly
            setFormData({
                date: new Date().toISOString().split('T')[0],
                titre: "", description: "", outils: [],
                reflexion_appris: "", reflexion_difficultes: "",
                competences: []
            })
            setSelectedFile(null)
            setFormKey(prev => prev + 1) // Force re-render of file input to clear it
        }
    }

    return (
        <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-2xl">
                <CardHeader className="bg-blue-950 text-white flex flex-row items-center justify-between p-6">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl font-black italic uppercase tracking-tighter">
                            <BookOpen className="w-6 h-6 text-blue-400" />
                            Journal de Bord
                        </CardTitle>
                        <p className="text-xs text-blue-300 font-medium">Capturez vos réalisations du jour</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {isOnline ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex gap-1.5 items-center px-3 py-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connecté
                            </Badge>
                        ) : (
                            <Badge className="bg-orange-500 text-white border-none flex gap-1.5 items-center px-3 py-1">
                                <WifiOff className="w-3 h-3" /> Hors-ligne
                            </Badge>
                        )}
                        {pendingCount > 0 && (
                            <button
                                type="button"
                                onClick={() => isOnline && syncService?.sync()}
                                className={`text-[10px] font-bold uppercase underline text-blue-300 hover:text-white transition-colors ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {pendingCount} en attente de synchro {isOnline ? "(Cliquer pour forcer)" : ""}
                            </button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                    {submitStatus === 'success' && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Send className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold">Entrée enregistrée !</p>
                                <p className="text-xs">Elle sera synchronisée dès que possible.</p>
                            </div>
                        </div>
                    )}

                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Date de l'activité</label>
                            <Input
                                type="date"
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl font-medium"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Titre évocateur</label>
                            <Input
                                className="h-12 border-gray-100 bg-gray-50/50 rounded-xl font-medium"
                                placeholder="ex: Maintenance préventive serveur"
                                value={formData.titre}
                                onChange={e => setFormData({ ...formData, titre: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Reflective Analysis - The "Qualiopi" Core */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                            <label className="text-sm font-black flex gap-2 items-center text-blue-900 uppercase italic">
                                <Lightbulb className="w-4 h-4 text-blue-600" />
                                Analyse Réflexive
                            </label>
                            <textarea
                                className="w-full p-3 bg-white border-none rounded-xl text-sm min-h-[120px] shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Qu'avez-vous appris aujourd'hui ? Quelles nouvelles compétences avez-vous mobilisées ?"
                                value={formData.reflexion_appris}
                                onChange={e => setFormData({ ...formData, reflexion_appris: e.target.value })}
                            />
                        </div>
                        <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                            <label className="text-sm font-black flex gap-2 items-center text-orange-900 uppercase italic">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                Défis & Obstacles
                            </label>
                            <textarea
                                className="w-full p-3 bg-white border-none rounded-xl text-sm min-h-[120px] shadow-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                placeholder="Quelles difficultés avez-vous rencontrées ? Comment les avez-vous surmontées ?"
                                value={formData.reflexion_difficultes}
                                onChange={e => setFormData({ ...formData, reflexion_difficultes: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Tools & Resources */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Outils & Moyens mobilisés</label>
                        <div className="flex gap-2">
                            <Input
                                className="h-10 border-gray-100 rounded-xl"
                                placeholder="Ajouter un outil..."
                                value={currentOutil}
                                onChange={e => setCurrentOutil(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddOutil())}
                            />
                            <Button type="button" onClick={handleAddOutil} variant="secondary" className="rounded-xl px-4">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.outils.map((outil, idx) => (
                                <Badge key={idx} variant="outline" className="bg-white px-3 py-1 rounded-lg flex gap-2 items-center">
                                    {outil}
                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFormData(p => ({ ...p, outils: p.outils.filter((_, i) => i !== idx) }))} />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Competences Link */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lien au Référentiel (Planning Période {new Date().getMonth() > 5 ? 2 : 1})</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {competences.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                        const exists = formData.competences.includes(c.id)
                                        setFormData({
                                            ...formData,
                                            competences: exists
                                                ? formData.competences.filter(id => id !== c.id)
                                                : [...formData.competences, c.id]
                                        })
                                    }}
                                    className={`
                                        text-xs p-4 rounded-xl border text-left transition-all flex justify-between items-start
                                        ${formData.competences.includes(c.id)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'}
                                    `}
                                >
                                    <span className="font-medium pr-4">{c.description}</span>
                                    {formData.competences.includes(c.id) && <Wifi className="w-3 h-3 opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Proof Upload */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Preuve / Illustration (Optionnel)</label>
                        <Input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setSelectedFile(e.target.files[0])
                                }
                            }}
                            className="bg-gray-50 border-gray-100 rounded-xl"
                        />
                        <p className="text-xs text-gray-400 mt-2 italic">Formats acceptés : Photos, PDF. Sera synchronisé une fois la connexion rétablie.</p>
                    </div>
                </CardContent>

                <CardFooter className="bg-gray-50 p-6 border-t border-gray-100">
                    <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl italic uppercase tracking-tighter rounded-2xl shadow-xl shadow-blue-200">
                        <Send className="w-6 h-6 mr-3" />
                        Publier dans le Journal
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
