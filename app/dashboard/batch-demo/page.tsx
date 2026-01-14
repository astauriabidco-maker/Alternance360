
import { getPromotionApprentices } from '@/app/actions/bulk-signing'
import { PromotionManager } from '@/components/dashboard/promotion-manager'

export default async function BatchDemoPage() {
    const referentielId = 'ref-bts-mco' // Hardcoded from seed
    const apprentices = await getPromotionApprentices(referentielId)

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Signature de Groupe (Batch Signing)</h1>

            <PromotionManager
                referentielId={referentielId}
                initialApprentices={apprentices}
            />
        </div>
    )
}
