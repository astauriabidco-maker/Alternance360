'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Layout, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { validateCompetence } from '@/app/tutor/actions'

interface CompetenceCardProps {
    id: string
    description: string
    blocTitle: string
    apprenticeName: string
    status: string
    onValidate: (id: string, status: 'ACQUIS' | 'NON_ACQUIS') => void
}

function CompetenceCard({ id, description, blocTitle, apprenticeName, status, onValidate }: CompetenceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full"
        >
            <Card className="overflow-hidden border-2 border-slate-100 hover:border-indigo-100 transition-colors shadow-sm bg-white rounded-3xl">
                <CardHeader className="bg-slate-50/50 pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 mb-2 rounded-lg">
                            {blocTitle}
                        </Badge>
                        <Badge variant="outline" className="text-slate-500 text-xs border-slate-200">
                            {apprenticeName}
                        </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                        {description}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        L'apprenti doit valider cette compétence durant la période actuelle.
                    </p>
                </CardContent>
                <CardFooter className="flex gap-3 p-6 pt-2 bg-slate-50/30">
                    <Button
                        onClick={() => onValidate(id, 'NON_ACQUIS')}
                        variant="ghost"
                        className="flex-1 h-12 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold border border-rose-100"
                    >
                        <XCircle className="mr-2 h-5 w-5" />
                        À revoir
                    </Button>
                    <Button
                        onClick={() => onValidate(id, 'ACQUIS')}
                        className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200"
                    >
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Valider
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

interface ValidationDeckProps {
    competences: {
        id: string
        tsfId: string
        description: string
        blocTitle: string
        apprenticeId: string
        apprenticeName: string
        status: string
    }[]
}

export function ValidationDeck({ competences }: ValidationDeckProps) {
    const [items, setItems] = useState(competences)
    const [history, setHistory] = useState<typeof competences>([])

    const handleValidate = async (tsfId: string, status: 'ACQUIS' | 'NON_ACQUIS') => {
        // Optimistic UI
        const item = items.find(i => i.tsfId === tsfId)
        if (!item) return

        setItems(prev => prev.filter(i => i.tsfId !== tsfId))
        setHistory(prev => [...prev, { ...item, status }])

        // Server Action
        await validateCompetence(tsfId, status)
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tout est à jour !</h3>
                <p className="text-slate-500 mt-2">Aucune compétence en attente pour cette période.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Objectifs de la Période</h3>
                <span className="text-sm font-medium text-slate-400">{items.length} restants</span>
            </div>

            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map(comp => (
                        <CompetenceCard
                            key={comp.tsfId}
                            id={comp.tsfId} // We pass TSF ID to validate the mapping
                            description={comp.description}
                            blocTitle={comp.blocTitle}
                            apprenticeName={comp.apprenticeName}
                            status={comp.status}
                            onValidate={handleValidate}
                        />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    )
}
