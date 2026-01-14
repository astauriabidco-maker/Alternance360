"use client"

import { useState } from "react"
import { updateTSFCell } from "@/app/actions/update-tsf"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import clsx from "clsx"

// Types matching our DB Data
type Period = { id: string; label: string }
type Competence = { id: string; description: string; bloc_title: string }
type TSFMapping = {
    period_id: string
    competence_id: string
    flag_cfa: boolean
    flag_entreprise: boolean
    status: string
}

interface TSFGridProps {
    contractId: string
    periods: Period[]
    competences: Competence[] // flattened list
    initialMappings: TSFMapping[]
}

export function TSFGrid({ contractId, periods, competences, initialMappings }: TSFGridProps) {
    const [mappings, setMappings] = useState<TSFMapping[]>(initialMappings)
    const [loadingId, setLoadingId] = useState<string | null>(null) // To show spinner per cell

    // Helper to find mapping
    const getMapping = (compId: string, periodId: string) =>
        mappings.find(m => m.competence_id === compId && m.period_id === periodId)

    // Toggle Logic: None -> CFA -> ENT -> MIXTE -> None
    const handleToggle = async (compId: string, periodId: string) => {
        const key = `${compId}-${periodId}`
        if (loadingId === key) return
        setLoadingId(key)

        const current = getMapping(compId, periodId)
        let nextCFA = false
        let nextENT = false

        // State Machine
        if (!current || (!current.flag_cfa && !current.flag_entreprise)) {
            nextCFA = true // Blue
        } else if (current.flag_cfa && !current.flag_entreprise) {
            nextCFA = false; nextENT = true // Green
        } else if (!current.flag_cfa && current.flag_entreprise) {
            nextCFA = true; nextENT = true // Mixte
        } else {
            nextCFA = false; nextENT = false // Reset
        }

        // Optimistic Update
        const newMappings = [...mappings]
        const idx = newMappings.findIndex(m => m.competence_id === compId && m.period_id === periodId)
        if (idx >= 0) {
            newMappings[idx] = { ...newMappings[idx], flag_cfa: nextCFA, flag_entreprise: nextENT }
        } else {
            newMappings.push({
                competence_id: compId,
                period_id: periodId,
                flag_cfa: nextCFA,
                flag_entreprise: nextENT,
                status: 'PLANIFIE'
            })
        }
        setMappings(newMappings)

        // Server Persistence
        await updateTSFCell({
            contractId,
            competenceId: compId,
            periodId,
            flag_cfa: nextCFA,
            flag_entreprise: nextENT
        })

        setLoadingId(null)
    }

    // Group by Bloc
    const grouped = competences.reduce((acc, curr) => {
        if (!acc[curr.bloc_title]) acc[curr.bloc_title] = []
        acc[curr.bloc_title].push(curr)
        return acc
    }, {} as Record<string, Competence[]>)

    // Missing Check
    const getMissingCompetences = () => {
        return competences.filter(c => {
            // Is Acquis?
            const isAcquis = mappings.some(m => m.competence_id === c.id && m.status === 'ACQUIS')
            if (isAcquis) return false
            // Has at least one flag?
            const hasFlag = mappings.some(m => m.competence_id === c.id && (m.flag_cfa || m.flag_entreprise))
            return !hasFlag
        })
    }

    const missing = getMissingCompetences()

    return (
        <div className="space-y-6">
            {missing.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-orange-800">
                                Attention : {missing.length} compétence(s) non planifiée(s)
                            </h3>
                            <div className="mt-2 text-sm text-orange-700">
                                Elles ne figurent sur aucune période. Veuillez les assigner.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle>Grille de Planification</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="p-4 text-left border-r bg-white sticky left-0 z-10 w-1/3">Compétences</th>
                                    {periods.map(p => (
                                        <th key={p.id} className="p-4 text-center border-r min-w-[120px] font-semibold">
                                            {p.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(grouped).map(([bloc, comps]) => (
                                    <>
                                        <tr key={bloc} className="bg-gray-50/50">
                                            <td colSpan={periods.length + 1} className="p-2 px-4 font-bold text-gray-800 border-y">
                                                {bloc}
                                            </td>
                                        </tr>
                                        {comps.map(comp => {
                                            const isAcquis = mappings.some(m => m.competence_id === comp.id && m.status === 'ACQUIS')
                                            return (
                                                <tr key={comp.id} className={clsx("border-b hover:bg-gray-50 transition-colors", isAcquis && "bg-gray-100 opacity-60")}>
                                                    <td className="p-3 border-r bg-white sticky left-0 font-medium text-gray-700">
                                                        {comp.description}
                                                        {isAcquis && <Badge variant="secondary" className="ml-2 text-xs">ACQUIS</Badge>}
                                                    </td>
                                                    {periods.map(p => {
                                                        const m = getMapping(comp.id, p.id)
                                                        const loading = loadingId === `${comp.id}-${p.id}`
                                                        return (
                                                            <td key={p.id} className="p-2 border-r text-center align-middle">
                                                                {isAcquis ? (
                                                                    <span className="text-xs text-gray-400 italic">Validé</span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleToggle(comp.id, p.id)}
                                                                        className={clsx(
                                                                            "w-full h-10 rounded-md border-2 transition-all flex items-center justify-center gap-1 shadow-sm",
                                                                            !m?.flag_cfa && !m?.flag_entreprise && "border-dashed border-gray-200 hover:border-gray-300",
                                                                            m?.flag_cfa && !m?.flag_entreprise && "bg-blue-50 border-blue-500 text-blue-700 font-bold",
                                                                            !m?.flag_cfa && m?.flag_entreprise && "bg-green-50 border-green-500 text-green-700 font-bold",
                                                                            m?.flag_cfa && m?.flag_entreprise && "bg-gradient-to-r from-blue-50 to-green-50 border-purple-400 text-purple-900",
                                                                            loading && "opacity-50 cursor-wait"
                                                                        )}
                                                                    >
                                                                        {m?.flag_cfa && <div className="w-2 h-2 rounded-full bg-blue-500" title="CFA" />}
                                                                        {m?.flag_entreprise && <div className="w-2 h-2 rounded-full bg-green-500" title="Entreprise" />}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
