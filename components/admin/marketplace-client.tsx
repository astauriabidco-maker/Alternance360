'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Download,
    ShieldCheck,
    Sparkles,
    Library,
    GraduationCap,
    Award,
    TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { importGlobalReferentiel } from '@/app/admin/actions'

type GlobalReferentiel = {
    id: string
    codeRncp: string
    title: string
    author: string | null
    downloadCount: number
    certificationLevel: string | null
    domain: string | null
    _count: { blocs: number }
}

export function MarketplaceClient({ referentiels }: { referentiels: GlobalReferentiel[] }) {
    const [search, setSearch] = useState('')
    const [levelFilter, setLevelFilter] = useState<string | null>(null)
    const [domainFilter, setDomainFilter] = useState<string | null>(null)
    const [authorFilter, setAuthorFilter] = useState<string | null>(null)
    const [forking, setForking] = useState<string | null>(null)

    const certificationLevels = useMemo(() => {
        const levels = new Set(referentiels.map(r => r.certificationLevel).filter(Boolean))
        return Array.from(levels) as string[]
    }, [referentiels])

    const domains = useMemo(() => {
        const d = new Set(referentiels.map(r => r.domain).filter(Boolean))
        return Array.from(d) as string[]
    }, [referentiels])

    const authors = useMemo(() => {
        const a = new Set(referentiels.map(r => r.author).filter(Boolean))
        return Array.from(a) as string[]
    }, [referentiels])

    const filtered = useMemo(() => {
        return referentiels.filter(ref => {
            const matchSearch = ref.title.toLowerCase().includes(search.toLowerCase()) ||
                ref.codeRncp.toLowerCase().includes(search.toLowerCase())
            const matchLevel = !levelFilter || ref.certificationLevel === levelFilter
            const matchDomain = !domainFilter || ref.domain === domainFilter
            const matchAuthor = !authorFilter || ref.author === authorFilter
            return matchSearch && matchLevel && matchDomain && matchAuthor
        })
    }, [referentiels, search, levelFilter, domainFilter, authorFilter])

    const handleFork = async (id: string) => {
        setForking(id)
        toast.info("Import en cours...")

        try {
            const result = await importGlobalReferentiel(id)
            if (result.success) {
                toast.success("Référentiel importé avec succès ! Retrouvez-le dans votre Atelier.")
            } else {
                toast.error(result.error || "Erreur lors de l'importation")
            }
        } catch (error) {
            toast.error("Erreur serveur")
        } finally {
            setForking(null)
        }
    }

    const getCertificationColor = (level: string | null) => {
        switch (level?.toUpperCase()) {
            case 'CAP': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'BTS': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'LICENCE PRO': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'MASTER': return 'bg-rose-100 text-rose-700 border-rose-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <div className="min-h-screen">
            {/* Immersive Header */}
            <header className="relative bg-gradient-to-r from-indigo-900 to-slate-900 py-16 px-8 -mx-8 -mt-8 mb-12 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-[0.3em]">
                        <Library size={16} />
                        <span>Bibliothèque Nationale</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                        Marketplace<span className="text-indigo-400">.</span>
                    </h1>

                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Explorez les référentiels certifiés par l'État et les OPCO. Forkez-les dans votre Atelier pour les personnaliser.
                    </p>

                    {/* Glassmorphism Search */}
                    <div className="mt-8 max-w-xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par titre ou code RNCP..."
                                className="h-14 pl-14 pr-6 rounded-2xl bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-indigo-400/30 text-lg"
                            />
                        </div>
                    </div>

                    {/* Filter Chips - Levels */}
                    {certificationLevels.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest py-1.5">Niveau:</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`rounded-full px-4 ${!levelFilter ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                onClick={() => setLevelFilter(null)}
                            >
                                Tous
                            </Button>
                            {certificationLevels.map(level => (
                                <Button
                                    key={level}
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-full px-4 ${levelFilter === level ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                    onClick={() => setLevelFilter(level)}
                                >
                                    {level}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Filter Chips - Domains & Certifiers */}
                    <div className="flex flex-col items-center gap-4 mt-6">
                        {domains.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 items-center">
                                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Domaine:</span>
                                {domains.map(dom => (
                                    <Button
                                        key={dom}
                                        variant="ghost"
                                        size="sm"
                                        className={`rounded-full px-4 ${domainFilter === dom ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                        onClick={() => setDomainFilter(domainFilter === dom ? null : dom)}
                                    >
                                        {dom}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {authors.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2 items-center">
                                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Auteur:</span>
                                {authors.map(auth => (
                                    <Button
                                        key={auth}
                                        variant="ghost"
                                        size="sm"
                                        className={`rounded-full px-4 ${authorFilter === auth ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                        onClick={() => setAuthorFilter(authorFilter === auth ? null : auth)}
                                    >
                                        {auth}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Results Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((ref) => (
                        <div
                            key={ref.id}
                            className="group bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:scale-[1.02] transition-all duration-300 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <GraduationCap size={28} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {ref.certificationLevel && (
                                        <Badge className={getCertificationColor(ref.certificationLevel)}>
                                            {ref.certificationLevel}
                                        </Badge>
                                    )}
                                    {ref.domain && (
                                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                                            {ref.domain}
                                        </Badge>
                                    )}
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                        <ShieldCheck size={12} /> Certifié OPCO
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 mb-6">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                                    {ref.codeRncp}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-3">
                                    {ref.title}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    {ref.author && (
                                        <div className="flex items-center gap-1">
                                            <Award size={14} />
                                            <span>{ref.author}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <TrendingUp size={14} />
                                        <span>{ref.downloadCount} imports</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 mb-6 py-4 border-y border-slate-50">
                                <div className="flex-1 text-center">
                                    <div className="text-2xl font-black text-slate-900">{ref._count.blocs}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blocs</div>
                                </div>
                            </div>

                            {/* Fork Button */}
                            <Button
                                onClick={() => handleFork(ref.id)}
                                disabled={forking === ref.id}
                                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black gap-3 transition-all active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-50"
                            >
                                {forking === ref.id ? (
                                    <>
                                        <Sparkles className="animate-spin" size={20} />
                                        Import en cours...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Forker dans mon Atelier
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="py-24 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Search size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Aucun modèle trouvé</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Aucun référentiel ne correspond à votre recherche. Créez votre propre référentiel dans l'Atelier !
                    </p>
                </div>
            )}
        </div>
    )
}
