import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import db from '@/lib/db'
import { ProofList } from './proof-list'
import { ValidationDeck } from '@/components/tutor/validation-deck'
import { SignatureModal } from '@/components/tutor/signature-modal'
import { MilestoneWidget } from '@/components/suivi/milestone-widget'
import { LayoutDashboard } from 'lucide-react'

export default async function TutorDashboardPage() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user || (user.role !== 'tutor' && user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'formateur')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Accès Refusé</h1>
                    <p className="text-slate-500 mb-6">Cet espace est réservé aux tuteurs.</p>
                    <a href="/dashboard" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Retourner à l'espace Apprenti
                    </a>
                </div>
            </div>
        )
    }

    // 1. Fetch Users logic (Simplified for MVP, assuming Tutor sees all linked apprentices)
    const whereCondition: any = { status: 'PENDING' }
    if (user.role === 'formateur') {
        whereCondition.user = {
            contracts: { some: { formateurId: user.id } }
        }
    }

    // 2. Fetch Proofs (Existing logic)
    const proofs = await db.proof.findMany({
        where: whereCondition,
        include: { user: { select: { firstName: true, lastName: true, fullName: true } } },
        orderBy: { createdAt: 'asc' },
        take: 5 // Limit proofs in main view as we focus on Competences
    })

    // Mapping proofs
    const formattedProofs = (proofs as any[]).map(proof => ({
        id: proof.id,
        created_at: proof.createdAt.toISOString(),
        titre: proof.title,
        url_fichier: proof.url,
        type: proof.type as 'PDF' | 'PHOTO',
        status: proof.status.toLowerCase() as 'pending' | 'validated' | 'rejected',
        feedback: proof.feedback,
        user_id: proof.userId,
        profiles: {
            first_name: proof.user?.firstName || proof.user?.fullName?.split(' ')[0] || 'Apprenti',
            last_name: proof.user?.lastName || proof.user?.fullName?.split(' ').slice(1).join(' ') || ''
        }
    }))

    // 3. LOGIC: Find CURRENT Period Competences for linked apprentices
    // For MVP, we assume the tutor follows apprentices. We need to find "Active Period" for these apprentices.
    // Simplifying assumption: Fetch *all* pending TSF mappings for contracts linked to this tutor for the current date.

    const today = new Date()

    // Find contracts managed by this tutor/formateur
    const contracts = await db.contract.findMany({
        where: user.role === 'formateur' ? { formateurId: user.id } : { userId: { not: undefined } }, // If tutor, simple hack for MVP
        include: {
            user: true,
            periodes: true
        }
    })

    const activeCompetences = []

    for (const contract of contracts) {
        // Find current period
        const currentPeriod = contract.periodes.find(p => p.startDate <= today && p.endDate >= today)

        if (currentPeriod) {
            // Find mappings for this period
            const mappings = await db.tSFMapping.findMany({
                where: {
                    contractId: contract.id,
                    periodId: currentPeriod.id,
                    status: 'PENDING'
                },
                include: {
                    competence: {
                        include: { bloc: true }
                    }
                }
            })

            // Format
            activeCompetences.push(...mappings.map(m => ({
                id: m.competence.id,
                tsfId: m.id,
                description: m.competence.description,
                blocTitle: m.competence.bloc.title,
                apprenticeId: contract.userId!,
                apprenticeName: contract.user?.fullName || "Apprenti",
                status: m.status
            })))
        }
    }

    // Fetch Milestones for these contracts
    const milestones = await db.milestone.findMany({
        where: {
            contractId: { in: contracts.map(c => c.id) },
            status: 'PENDING'
        },
        orderBy: { dueDate: 'asc' },
        take: 3
    })

    const userIds = [...new Set(proofs.map(p => p.userId))]

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Espace Tuteur</h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez la progression de vos apprentis</p>
                </div>
                <div className="flex items-center gap-3">
                    <SignatureModal />
                    <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 h-10">
                        <LayoutDashboard className="text-indigo-600" size={20} />
                        <span className="text-sm font-bold text-indigo-700">Vue Superviseur</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Validation Deck */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl shadow-slate-200">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Objectifs Période</p>
                            <p className="text-3xl font-black">{activeCompetences.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Preuves en attente</p>
                            <p className="text-3xl font-black text-slate-900">{formattedProofs.length}</p>
                        </div>
                    </div>

                    {/* NEW: Validation Deck */}
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            Validation Rapide (Période Actuelle)
                        </h2>
                        <ValidationDeck competences={activeCompetences} />
                    </div>
                </div>

                {/* Right Column: Latest Proofs List */}
                <div className="lg:col-span-1 border-l border-slate-100 pl-8 space-y-10">
                    <MilestoneWidget milestones={milestones} />

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Dernières Preuves
                        </h2>
                        <ProofList proofs={formattedProofs as any} currentUserId={user.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
