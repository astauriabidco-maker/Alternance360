'use client'

import { useState } from 'react'
import { SignaturePad } from '@/components/pedagogie/signature-pad'
import { signContract } from '@/app/tutor/actions/sign-contract'

export function ClientSignature({ contractId }: { contractId: string }) {
    const [loading, setLoading] = useState(false)

    const handleSign = async (data: string) => {
        setLoading(true)
        await signContract(contractId, data)
        setLoading(false)
    }

    if (loading) return <div className="text-center py-10 italic text-slate-400">Enregistrement de la signature...</div>

    return (
        <SignaturePad onSave={handleSign} />
    )
}
