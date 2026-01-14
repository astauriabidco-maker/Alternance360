'use client'

import React, { useState } from 'react'
import { Mail, CheckCircle, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { registerLead } from '@/app/actions/leads'
import { toast } from 'sonner'

interface LeadMagnetSectionProps {
    tenantName?: string
}

const LeadMagnetSection = ({ tenantName }: LeadMagnetSectionProps) => {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await registerLead({
                email,
                tenantName: tenantName || undefined,
                source: tenantName ? `tenant_${tenantName}` : 'landing_page'
            })

            if (result.success) {
                setIsSubmitted(true)
                toast.success('Inscription réussie !')
            } else {
                toast.error(result.error || 'Une erreur est survenue')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                    <div className="flex flex-col md:flex-row">

                        {/* Colonne Gauche : Visuel du Livre Blanc */}
                        <div className="md:w-5/12 bg-gradient-to-br from-slate-900 to-blue-900 p-12 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative group">
                                <div className="w-56 h-72 bg-white rounded-r-lg shadow-2xl flex flex-col p-6 transition-transform duration-500 hover:scale-105">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-1 bg-blue-600"></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Guide Expert</span>
                                    </div>
                                    <h3 className="text-slate-800 font-extrabold text-lg leading-tight mb-4">
                                        Réussir sa Transition Numérique
                                    </h3>
                                    <div className="mt-auto">
                                        <FileText className="text-blue-600 mb-2" size={32} />
                                        <p className="text-[8px] text-slate-500 font-medium">
                                            Sécurisation Audits Qualiopi & Suivi de l'Alternance
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-2 h-full bg-slate-200 rounded-l-sm"></div>
                            </div>
                        </div>

                        {/* Colonne Droite : Formulaire */}
                        <div className="md:w-7/12 p-10 md:p-12">
                            {!isSubmitted ? (
                                <>
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                                        Ressource Gratuite pour CFA
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
                                        Sécurisez vos audits Qualiopi et automatisez votre suivi.
                                    </h2>
                                    <p className="text-slate-600 mb-8 leading-relaxed">
                                        Découvrez les 4 piliers stratégiques pour transformer votre gestion de l'alternance.
                                    </p>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "Maîtriser les indicateurs 11 et 20 de Qualiopi",
                                            "Éviter les ruptures de financement OPCO",
                                            "Engager les tuteurs entreprise en 30 secondes"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                                <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-grow">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="email"
                                                required
                                                placeholder="Votre adresse e-mail professionnelle"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-200 whitespace-nowrap"
                                        >
                                            {isLoading ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    Recevoir le guide
                                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    <p className="mt-4 text-[10px] text-slate-400 italic">
                                        Nous respectons votre vie privée. Vos données sont traitées conformément au RGPD.
                                    </p>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">C'est en route !</h3>
                                    <p className="text-slate-600">
                                        Merci ! Votre guide arrive dans quelques instants à <strong>{email}</strong>.
                                    </p>
                                    <button
                                        onClick={() => { setIsSubmitted(false); setEmail('') }}
                                        className="mt-6 text-blue-600 font-semibold hover:underline"
                                    >
                                        S'inscrire avec un autre e-mail
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default LeadMagnetSection
