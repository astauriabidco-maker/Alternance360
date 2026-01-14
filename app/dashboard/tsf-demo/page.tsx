import { getApprenticeTSF } from '@/app/actions/tsf'
import { generateProgressData } from '@/app/actions/report-generator'
import { TSFView } from '@/components/dashboard/tsf-view'
import { ReportTable } from '@/components/dashboard/report-table'
import db from '@/lib/db'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from 'lucide-react'

export default async function TSFDemoPage() {
    // Fetch the latest contract for demo purposes
    const contract = await db.contract.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    if (!contract) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Aucun Contrat trouvé</AlertTitle>
                    <AlertDescription>
                        Lancez le script de seed `npx ts-node scripts/seed-tsf.ts` pour générer des données de test.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Fetch TSF Data
    const tsfData = await getApprenticeTSF(contract.id)

    // Fetch Report Data
    const reportData = await generateProgressData(contract.id)

    return (
        <div className="container mx-auto py-10 max-w-5xl space-y-16">
            <section>
                <h1 className="text-3xl font-bold mb-6">Simulation Apprenti (Vue Mobile/Desktop)</h1>
                <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                    <p><strong>Apprenti :</strong> {contract.user?.firstName} {contract.user?.lastName} ({contract.user?.email})</p>
                    <p><strong>Contrat ID :</strong> {contract.id}</p>
                </div>

                <TSFView
                    contractId={contract.id}
                    initialData={tsfData}
                />
            </section>

            <section className="border-t border-slate-200 pt-16">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Simulation Bilan (Vue PDF)</h2>
                    <p className="text-slate-500">Ci-dessous le rendu "Print-Ready" généré automatiquement.</p>
                </div>

                <div className="bg-slate-100 p-8 rounded-xl border border-slate-200 shadow-inner overflow-auto">
                    {/* We verify the import is working by using it */}
                    <ReportTable data={reportData} />
                </div>
            </section>
        </div>
    )
}
