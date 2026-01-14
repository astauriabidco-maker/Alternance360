"use client"

import { useState } from "react"
import { savePositioning, PositioningEntry } from "@/app/actions/save-positioning"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

// Types for Props (in real usage, passed from a Server Component that fetched the Referentiel)
interface CompetenceDto {
    id: string
    description: string
    bloc_title: string
}

interface DiagnosticFormProps {
    contractId: string
    apprenticeId: string
    competences: CompetenceDto[]
}

export function DiagnosticForm({ contractId, apprenticeId, competences }: DiagnosticFormProps) {
    const [levels, setLevels] = useState<Record<string, number>>({})
    const [result, setResult] = useState<{ message: string, reduction: number } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLevelChange = (compId: string, level: number) => {
        setLevels(prev => ({ ...prev, [compId]: level }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const entries: PositioningEntry[] = Object.entries(levels).map(([id, lvl]) => ({
            competence_id: id,
            level_initial: lvl
        }))

        const response = await savePositioning(contractId, apprenticeId, entries)

        if (response.success) {
            setResult({
                message: response.message,
                reduction: response.suggestedReductionMonths
            })
        }
        setLoading(false)
    }

    // Group by Bloc for presentation
    const grouped = competences.reduce((acc, curr) => {
        if (!acc[curr.bloc_title]) acc[curr.bloc_title] = []
        acc[curr.bloc_title].push(curr)
        return acc
    }, {} as Record<string, CompetenceDto[]>)

    if (result) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardHeader><CardTitle className="text-green-800">Diagnostic Terminé</CardTitle></CardHeader>
                <CardContent>
                    <p>{result.message}</p>
                    {result.reduction > 0 ? (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-300 shadow-sm">
                            <span className="text-2xl font-bold text-green-600">Suggestion: -{result.reduction} mois</span>
                            <p className="text-sm text-gray-600 mt-1">
                                Basé sur les acquis (Niveau 3+) détectés, nous recommandons une réduction de parcours.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-gray-600">Parcours standard recommandé (peu d&apos;acquis préalables détectés).</p>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([blocTitle, comps]) => (
                <Card key={blocTitle}>
                    <CardHeader className="bg-gray-50 pb-4 border-b">
                        <CardTitle className="text-lg">{blocTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {comps.map(comp => (
                            <div key={comp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <span className="text-sm font-medium flex-1">{comp.description}</span>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {[1, 2, 3, 4].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => handleLevelChange(comp.id, lvl)}
                                            className={`
                        w-10 h-10 rounded-md text-sm font-bold transition-all
                        ${levels[comp.id] === lvl
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-gray-500 hover:bg-gray-200'}
                      `}
                                            title={`Niveau ${lvl}`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-lg">
                {loading ? 'Calcul en cours...' : 'Valider le Diagnostic & Calculer'}
            </Button>
        </div>
    )
}
