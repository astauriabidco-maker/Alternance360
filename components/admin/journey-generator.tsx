'use client'

import { useState } from 'react'
import { initializeApprenticeJourney } from '@/app/admin/actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sparkles, BarChart3, ShieldCheck, Loader2, Calendar, LayoutGrid, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type JourneyGeneratorProps = {
    contractId: string
    referentielTitle: string
    blocCount: number
    durationMonths: number
}

export function JourneyGenerator({ contractId, referentielTitle, blocCount, durationMonths }: JourneyGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<'IDLE' | 'CONFIRM' | 'LOADING' | 'SUCCESS'>('IDLE')
    const [periodType, setPeriodType] = useState('SEMESTER')

    // Calculated stats for projection
    const periodMonths = periodType === 'SEMESTER' ? 6 : periodType === 'TRIMESTER' ? 3 : 1
    const numPeriods = Math.max(1, Math.ceil(durationMonths / periodMonths))
    const blocsPerPeriod = (blocCount / numPeriods).toFixed(1)

    // Calculate real density distribution for the chart
    const densityData = Array.from({ length: numPeriods }).map((_, i) => {
        const startIdx = Math.floor(i * blocCount / numPeriods)
        const endIdx = Math.floor((i + 1) * blocCount / numPeriods)
        const blocsInPeriod = endIdx - startIdx
        return {
            label: `${periodType === 'SEMESTER' ? 'S' : periodType === 'TRIMESTER' ? 'T' : 'M'}${i + 1}`,
            value: blocsInPeriod > 0 ? (blocsInPeriod / blocCount) * 400 : 10 // scale for visual
        }
    })

    async function handleGenerate() {
        setStep('LOADING')
        const res = await initializeApprenticeJourney(contractId, periodType)

        if (res.success) {
            setTimeout(() => setStep('SUCCESS'), 1500)
        } else {
            setStep('CONFIRM')
            toast.error(res.error || "Une erreur est survenue")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(val) => {
            setIsOpen(val)
            if (!val) setStep('IDLE')
        }}>
            <DialogTrigger asChild>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl gap-2 px-6 h-12 shadow-xl shadow-indigo-200 transition-all active:scale-95"
                    onClick={() => setStep('CONFIRM')}
                >
                    <Sparkles size={18} />
                    Générer le Parcours Pédagogique
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <AnimatePresence mode="wait">
                    {step === 'CONFIRM' && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Configuration Industrielle</h2>
                                    <p className="text-slate-500 font-medium">Prévisualisation du découpage pédagogique.</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Type de Période</span>
                                    <Select value={periodType} onValueChange={setPeriodType}>
                                        <SelectTrigger className="w-40 h-10 rounded-xl bg-white border-none shadow-sm font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SEMESTER">Semestres (6m)</SelectItem>
                                            <SelectItem value="TRIMESTER">Trimestres (3m)</SelectItem>
                                            <SelectItem value="MONTH">Mois (1m)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Échéances</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">{numPeriods} périodes</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                                            <LayoutGrid size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Intensité</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-900">{blocsPerPeriod} blocs/pér.</div>
                                    </div>
                                </div>

                                {/* Custom Bar Chart */}
                                <div className="pt-4">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Densité de compétences par période</div>
                                    <div className="flex items-end justify-between gap-2 h-24 px-2">
                                        {densityData.map((d, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <div
                                                    className="w-full bg-indigo-200 rounded-t-lg transition-all duration-500 hover:bg-indigo-500"
                                                    style={{ height: `${d.value}%` }}
                                                />
                                                <span className="text-[9px] font-bold text-slate-400">{d.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-lg transition-all"
                            >
                                Valider et Générer le TSF
                            </Button>
                        </motion.div>
                    )}

                    {step === 'LOADING' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-12 text-center flex flex-col items-center gap-6"
                        >
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                                <Sparkles className="absolute -top-1 -right-1 text-amber-500 animate-pulse" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Industrialisation en cours...</h3>
                                <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">
                                    Transformation du référentiel en plan de formation individualisé et génération des snapshots de conformité Qualiopi.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'SUCCESS' && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-12 text-center flex flex-col items-center gap-8"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-100 border-4 border-white">
                                <CheckCircle2 size={56} />
                            </div>

                            <div>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-3 px-3 py-1 text-xs gap-1.5 font-bold uppercase tracking-widest">
                                    <ShieldCheck size={14} /> Sceau de Conformité
                                </Badge>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">Parcours Conforme</h3>
                                <p className="text-slate-500 font-medium">
                                    Référentiel {referentielTitle} - Prêt pour le suivi.
                                </p>
                            </div>

                            <Button
                                onClick={() => setIsOpen(false)}
                                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg transition-all"
                            >
                                Accéder au Tableau de Bord
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
