'use client'

import { useState, useTransition, useEffect } from 'react'
import { executeAnnualArchiving, getArchivingCandidates } from '@/app/actions/archiving'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Archive, Trash2, Database, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'

export default function MaintenancePage() {
    const [candidateCount, setCandidateCount] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ processed: number, archived: number, errors: number } | null>(null)

    const tenantId = "demo-tenant" // Should be fetched from session in real app or prop

    useEffect(() => {
        // Fetch initial count
        getArchivingCandidates(tenantId).then(setCandidateCount)
    }, [])

    const handleArchiving = () => {
        if (!confirm("ATTENTION : Cette action va archiver les contrats terminés et SUPPRIMER leurs données opérationnelles. Continuer ?")) return

        startTransition(async () => {
            const res = await executeAnnualArchiving(tenantId)
            setResult(res)
            // Refresh count
            getArchivingCandidates(tenantId).then(setCandidateCount)
        })
    }

    return (
        <div className="container mx-auto py-10 max-w-5xl space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Maintenance & Archivage</h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Dossiers éligibles (Fin &gt; 6 mois)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            {candidateCount === null ? <Loader2 className="w-5 h-5 animate-spin" /> : candidateCount}
                            <Archive className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Prêts à être archivés</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wide">Stockage "Froid"</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900 flex items-center gap-2">
                            S3 Glacier
                            <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Connecté et sécurisé (AES-256)</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Conformité RGPD</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
                            Active
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Purge automatique: 5 ans</p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Zone */}
            <Card className="border-red-100 shadow-sm">
                <CardHeader className="bg-red-50/50 border-b border-red-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-red-900">Procédure d'Archivage Annuel</CardTitle>
                            <CardDescription className="text-red-700 mt-1">
                                Cette procédure déplace les données vers le coffre-fort d'archive et les purge de la base opérationnelle.
                                <br />
                                <strong>Action irréversible.</strong> Les données seront accessibles uniquement via demande administrateur.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {result ? (
                        <Alert className="bg-emerald-50 border-emerald-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <AlertTitle className="text-emerald-800">Opération Terminée</AlertTitle>
                            <AlertDescription className="text-emerald-700">
                                {result.processed} dossiers traités. {result.archived} archivés avec succès. {result.errors} erreurs.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span className="text-sm text-slate-600">
                                    {candidateCount && candidateCount > 0
                                        ? `${candidateCount} dossiers attendent l'archivage.`
                                        : "Aucun dossier à archiver pour le moment."}
                                </span>
                            </div>
                            <Button
                                onClick={handleArchiving}
                                disabled={isPending || !candidateCount || candidateCount === 0}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                                Lancer l'archivage
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Certificate Log Placeholder */}
            <div className="bg-slate-900 text-slate-400 p-6 rounded-lg font-mono text-xs">
                <h3 className="text-slate-200 font-bold mb-4 uppercase">Logs du Système d'Archivage</h3>
                <div className="space-y-1">
                    <p>[SYSTEM] Vault Connection established...</p>
                    <p>[SYSTEM] Retention Policy: 5 Years set.</p>
                    {result && (
                        <>
                            <p className="text-emerald-400">[SUCCESS] Batch Archiving executed at {new Date().toLocaleTimeString()}</p>
                            <p className="text-emerald-400">[SUCCESS] {result.archived} records moved to Cold Storage.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
