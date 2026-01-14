"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Image as ImageIcon, CheckCircle, Clock, XCircle, Search } from "lucide-react"
import clsx from "clsx"

interface Proof {
    id: string
    competence_description: string
    type: 'IMG' | 'PDF'
    status: 'VALIDATED' | 'PENDING' | 'REJECTED'
    comment?: string
    created_at: string
}

interface JournalProps {
    proofs: Proof[]
}

export function ApprenticeJournal({ proofs }: JournalProps) {

    const getStatusIcon = (status: Proof['status']) => {
        switch (status) {
            case 'VALIDATED': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'PENDING': return <Clock className="w-4 h-4 text-orange-500" />
            case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />
        }
    }

    const getStatusBadge = (status: Proof['status']) => {
        switch (status) {
            case 'VALIDATED': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Validé</Badge>
            case 'PENDING': return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">En attente</Badge>
            case 'REJECTED': return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">À refaire</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Journal de Bord</h2>
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une preuve..."
                        className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
                    />
                </div>
            </div>

            {proofs.length === 0 ? (
                <Card className="border-dashed border-2 bg-gray-50/50 py-12">
                    <CardContent className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">Aucune preuve déposée pour le moment.</p>
                        <p className="text-sm">Utilisez le formulaire ci-dessus pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative space-y-4">
                    {/* Activity Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

                    {proofs.map((proof) => (
                        <div key={proof.id} className="relative pl-12">
                            {/* Dot */}
                            <div className={clsx(
                                "absolute left-[18px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                proof.status === 'VALIDATED' ? 'bg-green-500' :
                                    proof.status === 'PENDING' ? 'bg-orange-500' : 'bg-red-500'
                            )} />

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                                                {proof.type === 'IMG' ? <ImageIcon className="w-5 h-5 text-gray-600" /> : <FileText className="w-5 h-5 text-gray-600" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 line-clamp-1">
                                                    {proof.competence_description}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Déposé le {new Date(proof.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {getStatusBadge(proof.status)}
                                        </div>
                                    </div>

                                    {proof.comment && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border-l-2 border-gray-200">
                                            "{proof.comment}"
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
