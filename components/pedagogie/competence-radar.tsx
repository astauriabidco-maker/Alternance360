'use client'

import { useEffect, useState } from 'react'
import { RadarChart } from './radar-chart'
import { getCompetenceProfile } from '@/app/actions/progress'
import { Loader2 } from 'lucide-react'

export function CompetenceRadar({ userId }: { userId?: string }) {
    const [data, setData] = useState<{ label: string; value: number }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const res = await getCompetenceProfile(userId)
            if (res.success && res.data) {
                setData(res.data)
            } else {
                setError(res.error || "Erreur inconnue")
            }
            setLoading(false)
        }
        fetch()
    }, [userId])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-100 italic text-slate-400 text-sm gap-2">
                <Loader2 className="animate-spin" size={16} />
                Chargement du profil...
            </div>
        )
    }

    if (error || data.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm p-8 text-center">
                <p className="font-bold">Profil indisponible</p>
                <p className="text-xs mt-1">Déposez et validez des preuves pour voir votre progression.</p>
            </div>
        )
    }

    return <RadarChart data={data} title="Bilan par Blocs" />
}
