'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveAttendance } from '@/app/actions/monitoring'
import { Check, User, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceManagerProps {
    contracts: {
        id: string
        user: { fullName: string | null }
    }[]
}

export function AttendanceManager({ contracts }: AttendanceManagerProps) {
    const [selectedContract, setSelectedContract] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [hours, setHours] = useState('7')
    const [status, setStatus] = useState<'PRESENT' | 'ABSENT_JUSTIFIED' | 'ABSENT_UNJUSTIFIED'>('PRESENT')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!selectedContract) return toast.error("Sélectionnez un apprenti")

        setLoading(true)
        const res = await saveAttendance({
            contractId: selectedContract,
            date,
            hours: parseFloat(hours),
            status
        })
        setLoading(false)
        toast.success("Émargement enregistré")
    }

    return (
        <Card className="bg-white border-slate-200 rounded-[2.5rem] shadow-lg overflow-hidden border-none outline outline-1 outline-slate-100">
            <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                    <Check className="text-emerald-400" />
                    Saisie d'Émargement
                </CardTitle>
                <p className="text-slate-400 text-sm">Enregistrez les présences aux sessions de formation</p>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Apprenti</label>
                        <Select onValueChange={setSelectedContract}>
                            <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-slate-100">
                                <SelectValue placeholder="Choisir un apprenti..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                {contracts.map((c) => (
                                    <SelectItem key={c.id} value={c.id} className="rounded-xl">
                                        {c.user?.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-2xl h-12 bg-slate-50 border-slate-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Heures</label>
                        <Input
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="rounded-2xl h-12 bg-slate-50 border-slate-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Statut</label>
                        <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                            <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-slate-100">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="PRESENT" className="rounded-xl">Présent</SelectItem>
                                <SelectItem value="ABSENT_JUSTIFIED" className="rounded-xl">Absence Justifiée</SelectItem>
                                <SelectItem value="ABSENT_UNJUSTIFIED" className="rounded-xl text-rose-600">Absence Injustifiée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-10 h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 font-bold text-lg transition-all active:scale-[0.98]"
                >
                    Valider l'Émargement
                </Button>
            </CardContent>
        </Card>
    )
}
