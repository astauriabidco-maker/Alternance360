'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MoreVertical,
    Calendar,
    Users,
    MapPin,
    Euro,
    Clock,
    Pencil,
    Trash
} from 'lucide-react'
import { OfferForm } from './offer-form'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteOffer } from '@/app/actions/offers'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface OfferListProps {
    offers: any[] // Type properly
    referentiels: any[]
}

export function OfferList({ offers, referentiels }: OfferListProps) {

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
            const res = await deleteOffer(id)
            if (res.success) toast.success("Offre supprimée")
            else toast.error(res.error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200'
            case 'FULL': return 'bg-rose-100 text-rose-700 border-rose-200'
            case 'DRAFT': return 'bg-amber-100 text-amber-700 border-amber-200'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return 'Inscriptions Ouvertes'
            case 'CLOSED': return 'Fermé'
            case 'FULL': return 'Complet'
            case 'DRAFT': return 'Brouillon'
            default: return status
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map(offer => (
                <div key={offer.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <Badge className={`${getStatusColor(offer.status)} border rounded-lg px-3 py-1`}>
                            {getStatusLabel(offer.status)}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                    <MoreVertical size={16} className="text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <OfferForm
                                        referentiels={referentiels}
                                        existingOffer={offer}
                                        trigger={
                                            <div className="flex items-center gap-2 w-full cursor-pointer">
                                                <Pencil size={14} /> Modifier
                                            </div>
                                        }
                                    />
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(offer.id)}>
                                    <Trash size={14} className="mr-2" /> Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="mb-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {offer.referentiel.codeRncp}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
                            {offer.title}
                        </h3>
                        <div className="text-sm font-medium text-slate-500 line-clamp-2">
                            {offer.description || "Aucune description commerciale."}
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Calendar size={14} className="text-slate-400" />
                                {format(new Date(offer.startDate), 'dd MMM yyyy', { locale: fr })}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Clock size={14} className="text-slate-400" />
                                {offer.duration}h
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <MapPin size={14} className="text-slate-400" />
                                {offer.campus || "Distanciel"}
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 font-black">
                                <Euro size={14} className="text-emerald-500" />
                                {offer.price} €
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
