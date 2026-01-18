'use client'

import { useState, useEffect } from 'react'
import { listApiKeysAction, generateApiKeyAction, revokeApiKeyAction } from '@/app/actions/api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Copy, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function ApiKeyManagement() {
    const [keys, setKeys] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [generating, setGenerating] = useState(false)
    const [newKeyRaw, setNewKeyRaw] = useState<string | null>(null)

    useEffect(() => {
        loadKeys()
    }, [])

    async function loadKeys() {
        try {
            const data = await listApiKeysAction()
            setKeys(data)
        } catch (e) {
            toast.error("Échec du chargement des clés")
        } finally {
            setLoading(false)
        }
    }

    async function handleGenerate() {
        if (!newName) return toast.error("Veuillez donner un nom à la clé")
        setGenerating(true)
        try {
            const res = await generateApiKeyAction(newName)
            setNewKeyRaw(res.plainKey || null)
            setNewName('')
            await loadKeys()
            toast.success("Clé API générée")
        } catch (e) {
            toast.error("Erreur de génération")
        } finally {
            setGenerating(false)
        }
    }

    async function handleRevoke(id: string) {
        if (!confirm("Révoquer cette clé ? Elle ne pourra plus être utilisée.")) return
        try {
            await revokeApiKeyAction(id)
            await loadKeys()
            toast.success("Clé révoquée")
        } catch (e) {
            toast.error("Erreur de révocation")
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copié dans le presse-papier")
    }

    return (
        <div className="space-y-8">
            <Card className="rounded-2xl border-slate-200">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Générer une nouvelle clé</CardTitle>
                    <CardDescription>Donnez un nom descriptif à votre clé pour l'identifier facilement.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="keyName">Nom de la clé</Label>
                        <Input
                            id="keyName"
                            placeholder="ex: Intégration CRM"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleGenerate} disabled={generating || !newName} className="h-10 px-6 font-bold">
                        {generating ? "Génération..." : "Générer"}
                    </Button>
                </CardContent>
            </Card>

            {newKeyRaw && (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 space-y-4">
                    <div className="flex items-center gap-3 text-amber-800">
                        <AlertCircle className="w-5 h-5" />
                        <h4 className="font-bold">Clé d'API générée - À copier maintenant !</h4>
                    </div>
                    <p className="text-sm text-amber-700 font-medium">
                        Pour votre sécurité, nous n'afficherons cette clé qu'une seule fois. Veuillez la copier et la stocker de manière sécurisée.
                    </p>
                    <div className="flex gap-2">
                        <code className="flex-1 p-3 bg-white rounded-xl border border-amber-200 font-mono text-sm break-all font-bold">
                            {newKeyRaw}
                        </code>
                        <Button variant="outline" onClick={() => copyToClipboard(newKeyRaw)} className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100">
                            <Copy className="w-4 h-4 mr-2" /> Copier
                        </Button>
                    </div>
                    <Button variant="ghost" className="text-amber-700 w-full text-xs font-bold" onClick={() => setNewKeyRaw(null)}>
                        J'ai bien copié la clé
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Vos clés API</h3>
                {loading ? (
                    <p className="text-slate-500 text-sm">Chargement...</p>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium italic">Aucune clé active. Générez-en une pour commencer l'intégration.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {keys.map((key) => (
                            <div key={key.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{key.name}</span>
                                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-slate-50">{key.prefix}***</Badge>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium flex gap-4">
                                        <span>Créée le {new Date(key.createdAt).toLocaleDateString()}</span>
                                        {key.lastUsed ? (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle2 size={12} /> Utilisation: {new Date(key.lastUsed).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span>Jamais utilisée</span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => handleRevoke(key.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
