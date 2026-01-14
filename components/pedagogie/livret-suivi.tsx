"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LivretProps {
    apprentice: { name: string, email: string, contract_start: string, contract_end: string, referentiel: string }
    blocs: { title: string, competences: { description: string, status: string }[] }[]
}

export function LivretSuivi({ apprentice, blocs }: LivretProps) {
    return (
        <div className="bg-white p-8 max-w-[21cm] mx-auto print:p-0 print:shadow-none shadow-xl border">
            {/* Header / Logo Section */}
            <div className="flex justify-between items-start mb-12 border-b-2 border-blue-600 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Antigravity</h1>
                    <p className="text-xs text-blue-600 font-bold">Plateforme de Suivi d'Apprentissage</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">LIVRET DE SUIVI</h2>
                    <p className="text-sm text-gray-500">Document Qualiopi - Indicateur 11</p>
                </div>
            </div>

            {/* Apprentice Info */}
            <div className="grid grid-cols-2 gap-8 mb-12 bg-gray-50 p-6 rounded-lg">
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">Apprenti</p>
                    <p className="text-lg font-bold">{apprentice.name}</p>
                    <p className="text-sm text-gray-600">{apprentice.email}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">Période de Contrat</p>
                    <p className="text-sm font-medium">{apprentice.contract_start} au {apprentice.contract_end}</p>
                    <p className="text-xs text-blue-600 font-bold uppercase mt-2">Référentiel : {apprentice.referentiel}</p>
                </div>
            </div>

            {/* Competence Matrix */}
            <div className="space-y-8">
                {blocs.map((bloc, i) => (
                    <div key={i} className="break-inside-avoid">
                        <h3 className="bg-blue-900 text-white px-4 py-2 font-bold mb-4 rounded">{bloc.title}</h3>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 uppercase border-b">
                                    <th className="py-2 font-bold w-full">Compétence</th>
                                    <th className="py-2 font-bold px-4 text-center">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bloc.competences.map((comp, j) => (
                                    <tr key={j} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 text-sm pr-4">{comp.description}</td>
                                        <td className="py-3 px-4 text-center">
                                            {comp.status === 'VALIDATED' ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">ACQUISE</Badge>
                                            ) : (
                                                <span className="text-xs text-gray-300 font-medium">EN COURS</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* Footer / Signatures */}
            <div className="mt-20 pt-10 border-t grid grid-cols-2 gap-12 print:mt-10">
                <div className="space-y-12">
                    <p className="text-sm font-bold text-gray-800">Visa de l'Organisme de Formation</p>
                    <div className="h-20 border-2 border-dashed border-gray-200 rounded"></div>
                </div>
                <div className="space-y-12">
                    <p className="text-sm font-bold text-gray-800">Visa de l'Entreprise</p>
                    <div className="h-20 border-2 border-dashed border-gray-200 rounded"></div>
                </div>
            </div>

            <p className="mt-12 text-[10px] text-center text-gray-400">
                Généré automatiquement par Antigravity le {new Date().toLocaleDateString()} - Document à conserver pour audit Qualiopi.
            </p>
        </div>
    )
}
