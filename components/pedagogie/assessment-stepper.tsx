"use client"

import { useState } from "react"
import { saveDraft, submitAssessment } from "@/app/actions/assessment"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Types
interface Competence { id: string, description: string, bloc_title: string }
interface StepperProps { contractId: string, assessmentId: string | null, competences: Competence[] }

export function AssessmentStepper({ contractId, assessmentId, competences }: StepperProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [scores, setScores] = useState<Record<string, number>>({})
    const [sessionId, setSessionId] = useState<string | null>(assessmentId)
    const [submitted, setSubmitted] = useState(false)

    // Grouping
    const groups = competences.reduce((acc, curr) => {
        if (!acc[curr.bloc_title]) acc[curr.bloc_title] = []
        acc[curr.bloc_title].push(curr)
        return acc
    }, {} as Record<string, Competence[]>)

    const blocTitles = Object.keys(groups)
    const currentBloc = blocTitles[currentStep]
    const currentComps = groups[currentBloc] || []

    const handleScore = (compId: string, score: number) => {
        setScores(prev => ({ ...prev, [compId]: score }))
    }

    const handleNext = async () => {
        // Save Draft Logic
        const entries = currentComps.map(c => ({
            competence_id: c.id,
            level_initial: scores[c.id] || 0
        }))

        const res = await saveDraft(contractId, sessionId, entries)
        if (res.success && res.assessmentId) {
            setSessionId(res.assessmentId)
            if (currentStep < blocTitles.length - 1) {
                setCurrentStep(prev => prev + 1)
            } else {
                // Final Step -> Submit
                await submitAssessment(res.assessmentId)
                setSubmitted(true)
            }
        }
    }

    if (submitted) {
        return (
            <Card className="max-w-xl mx-auto text-center py-12">
                <CardTitle className="text-2xl text-green-700">Positionnement Envoyé !</CardTitle>
                <CardContent className="mt-4 text-gray-600">
                    Votre formateur va analyser vos réponses et valider votre parcours.
                    <br />
                    Vous recevrez une notification une fois le TSF généré.
                </CardContent>
            </Card>
        )
    }

    const progress = ((currentStep) / blocTitles.length) * 100

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Bloc {currentStep + 1}: {currentBloc}</CardTitle>
                        <Badge variant="outline">{currentComps.length} Compétences</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {currentComps.map(comp => {
                        const score = scores[comp.id]
                        return (
                            <div key={comp.id} className="border-b pb-4 last:border-0">
                                <p className="mb-3 font-medium text-gray-800">{comp.description}</p>

                                <div className="flex flex-wrap gap-2 items-center">
                                    {[0, 1, 2, 3, 4].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => handleScore(comp.id, val)}
                                            className={`
                                                w-10 h-10 rounded-full font-bold border-2 transition-all
                                                ${score === val
                                                    ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-md'
                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}
                                            `}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                    <span className="text-xs text-gray-400 ml-2">
                                        {score === 4 ? 'Expert' : score === 0 ? 'Novice' : ''}
                                    </span>
                                </div>

                                {/* Proof Condition */}
                                {score >= 3 && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100 flex items-center justify-between">
                                        <span className="text-xs text-blue-700">Justificatif requis (Niveau Avancé)</span>
                                        <input type="file" className="text-xs text-gray-500" disabled />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={handleNext} disabled={currentComps.some(c => scores[c.id] === undefined)}>
                        {currentStep === blocTitles.length - 1 ? 'Terminer & Envoyer' : 'Suivant'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
