'use client'

import { useState, useTransition } from 'react'
import { ApprenticeSummary, signPromotionReports } from '@/app/actions/bulk-signing'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, FileSignature, CheckCircle, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function PromotionManager({
    referentielId,
    initialApprentices
}: {
    referentielId: string,
    initialApprentices: ApprenticeSummary[]
}) {
    const [selected, setSelected] = useState<string[]>([])
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [progress, setProgress] = useState(0)

    const toggleAll = () => {
        if (selected.length === initialApprentices.length) {
            setSelected([])
        } else {
            setSelected(initialApprentices.map(a => a.id))
        }
    }

    const toggleOne = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id))
        } else {
            setSelected([...selected, id])
        }
    }

    const handleBatchSign = () => {
        if (!confirm(`Confirmez-vous la signature irréversible de ${selected.length} livrets ?`)) return

        setStatus('PROCESSING')
        setProgress(10)

        // Simulate progress for UX since server action is one-shot atomic
        const interval = setInterval(() => {
            setProgress(p => Math.min(p + 10, 90))
        }, 500)

        startTransition(async () => {
            const result = await signPromotionReports(referentielId, selected)
            clearInterval(interval)

            if (result.success) {
                setProgress(100)
                setStatus('SUCCESS')
            } else {
                setStatus('ERROR')
            }
        })
    }

    if (status === 'SUCCESS') {
        return (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-emerald-800">Succès !</h2>
                <p className="text-emerald-600 mt-2">
                    {selected.length} livrets ont été signés, générés et archivés.
                </p>
                <div className="mt-4 text-sm text-emerald-500 font-mono">
                    Transaction ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
                <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                    Retour à la liste
                </Button>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gestion de Promotion (BTS MCO 2026)</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{initialApprentices.length} apprentis inscrits</p>
                </div>
                {selected.length > 0 && (
                    <Button
                        onClick={handleBatchSign}
                        disabled={isPending}
                        className="bg-blue-900 hover:bg-blue-800"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
                        Signer {selected.length} livrets
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {status === 'PROCESSING' && (
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between text-sm text-blue-900 font-medium">
                            <span>Traitement de la signature de groupe...</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                {status === 'ERROR' && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Erreur Critique</AlertTitle>
                        <AlertDescription>
                            La transaction a échoué. Aucune modification n'a été appliquée (Rollback effectué).
                        </AlertDescription>
                    </Alert>
                )}

                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                            <tr>
                                <th className="p-4 w-12">
                                    <Checkbox
                                        checked={selected.length === initialApprentices.length && initialApprentices.length > 0}
                                        onCheckedChange={toggleAll}
                                    />
                                </th>
                                <th className="p-4">Apprenti</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Progression TSF</th>
                                <th className="p-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {initialApprentices.map((apprentice) => (
                                <tr key={apprentice.id} className={selected.includes(apprentice.id) ? "bg-blue-50/50" : ""}>
                                    <td className="p-4">
                                        <Checkbox
                                            checked={selected.includes(apprentice.id)}
                                            onCheckedChange={() => toggleOne(apprentice.id)}
                                        />
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">
                                        {apprentice.firstName} {apprentice.lastName}
                                    </td>
                                    <td className="p-4 text-slate-500">{apprentice.email}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Progress value={apprentice.progress} className="h-1.5 w-24" />
                                            <span className="text-xs">{apprentice.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${apprentice.tsfStatus === 'VALIDATED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {apprentice.tsfStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {initialApprentices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                                        Aucun apprenti trouvé pour ce référentiel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
