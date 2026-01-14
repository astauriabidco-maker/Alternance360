"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle } from "lucide-react"

interface BlocProgress {
    title: string
    total: number
    validated: number
}

export function ProgressDashboard({ progress }: { progress: BlocProgress[] }) {

    const totalSkills = progress.reduce((acc, b) => acc + b.total, 0)
    const totalValidated = progress.reduce((acc, b) => acc + b.validated, 0)
    const overallPercent = totalSkills > 0 ? Math.round((totalValidated / totalSkills) * 100) : 0

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="md:col-span-1 bg-blue-600 text-white">
                    <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                        <div className="relative w-24 h-24 mb-4">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    className="stroke-blue-400/30"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    strokeWidth="3.8"
                                />
                                <path
                                    className="stroke-white"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    strokeWidth="3.8"
                                    strokeDasharray={`${overallPercent}, 100`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                                {overallPercent}%
                            </div>
                        </div>
                        <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Progression Globale</p>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6"><p className="text-xs text-gray-500 font-bold uppercase">Compétences</p><p className="text-2xl font-bold">{totalSkills}</p></CardContent></Card>
                    <Card><CardContent className="pt-6"><p className="text-xs text-gray-500 font-bold uppercase">Validées</p><p className="text-2xl font-bold text-green-600">{totalValidated}</p></CardContent></Card>
                    <Card><CardContent className="pt-6"><p className="text-xs text-gray-500 font-bold uppercase">Reste à faire</p><p className="text-2xl font-bold text-blue-600">{totalSkills - totalValidated}</p></CardContent></Card>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {progress.map((bloc, i) => {
                    const pct = Math.round((bloc.validated / bloc.total) * 100)
                    return (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-800 line-clamp-1">{bloc.title}</h4>
                                    <Badge variant="secondary">{pct}%</Badge>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> {bloc.validated} Validées</span>
                                    <span className="flex items-center gap-1"><Circle className="w-3 h-3 text-gray-300" /> {bloc.total - bloc.validated} Restantes</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
