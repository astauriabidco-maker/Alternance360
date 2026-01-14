'use client'

import { useState } from 'react'
import { createContract } from '@/app/admin/actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type UserOption = { id: string, name: string }
type RefOption = { id: string, title: string }

export function ContractForm({ apprentices, formateurs, referentiels }: { apprentices: UserOption[], formateurs: UserOption[], referentiels: RefOption[] }) {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMsg('')
        const res = await createContract(formData)
        setLoading(false)
        if (res.error) setMsg('Erreur: ' + res.error)
        else setMsg('Succès: ' + res.message)
    }

    return (
        <Card className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <CardHeader className="p-10 pb-6">
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Nouveau Contrat d'Alternance 📄</CardTitle>
                <p className="text-slate-500 font-medium">Configurez les dates et les intervenants pour ce parcours d'apprentissage.</p>
            </CardHeader>
            <CardContent className="p-10 pt-0">
                <form action={handleSubmit} className="space-y-6">
                    {msg && (
                        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${msg.startsWith('Err') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                            {msg.startsWith('Err') ? '❌' : '✅'}
                            {msg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Apprenti</Label>
                        <Select name="userId" required>
                            <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-blue-600/10">
                                <SelectValue placeholder="Sélectionner un apprenti" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                {apprentices.map(u => (
                                    <SelectItem key={u.id} value={u.id} className="rounded-lg">{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Formateur Référent</Label>
                            <Select name="formateurId">
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50">
                                    <SelectValue placeholder="Optionnel" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">
                                    <SelectItem value="none" className="rounded-lg">Scolarité standard (Aucun)</SelectItem>
                                    {formateurs.map(f => (
                                        <SelectItem key={f.id} value={f.id} className="rounded-lg">{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Diplôme / RNCP</Label>
                            <Select name="referentielId" required>
                                <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50">
                                    <SelectValue placeholder="Sélectionner le diplôme" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">
                                    {referentiels.map(r => (
                                        <SelectItem key={r.id} value={r.id} className="rounded-lg">{r.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date de début</Label>
                            <Input name="startDate" type="date" required className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-blue-600/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date de fin</Label>
                            <Input name="endDate" type="date" required className="h-12 rounded-xl border-slate-100 bg-slate-50/50 focus:ring-blue-600/10" />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-lg shadow-xl shadow-blue-500/20 mt-4 transition-all active:scale-[0.98]" disabled={loading}>
                        {loading ? 'Génération...' : 'Générer le Contrat'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
