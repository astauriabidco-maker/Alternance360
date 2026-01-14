'use client'

import Link from 'next/link'
import { Check, Anchor, ArrowRight, Zap, Building2, Crown } from 'lucide-react'

const plans = [
    {
        name: 'Essentiel',
        description: 'Pour les petits CFA qui démarrent',
        price: '199',
        period: '/mois',
        features: [
            'Jusqu\'à 50 apprentis',
            '1 référentiel RNCP',
            'Journal de bord mobile',
            'TSF automatisé',
            'Support email'
        ],
        cta: 'Démarrer l\'essai gratuit',
        highlighted: false,
        icon: Zap
    },
    {
        name: 'Professionnel',
        description: 'Pour les CFA en croissance',
        price: '499',
        period: '/mois',
        features: [
            'Jusqu\'à 200 apprentis',
            'Référentiels illimités',
            'Journal de bord + Évaluations',
            'Alertes intelligentes',
            'Génération PDF Livret',
            'Support prioritaire',
            'Multi-formateurs'
        ],
        cta: 'Choisir Professionnel',
        highlighted: true,
        icon: Building2
    },
    {
        name: 'Enterprise',
        description: 'Pour les groupes multi-sites',
        price: 'Sur devis',
        period: '',
        features: [
            'Apprentis illimités',
            'Multi-tenant (sites isolés)',
            'API & Intégrations',
            'Signature électronique',
            'Account Manager dédié',
            'SLA garanti 99.9%',
            'Formation sur site'
        ],
        cta: 'Contacter les ventes',
        highlighted: false,
        icon: Crown
    }
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
            {/* Header */}
            <nav className="max-w-7xl mx-auto px-6 py-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                        <Anchor className="text-white" size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">Alternance<span className="text-emerald-500">360</span></span>
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
                        Des tarifs simples et transparents
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Choisissez la formule adaptée à la taille de votre CFA. Tous les plans incluent un essai gratuit de 14 jours.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative rounded-[2.5rem] p-8 transition-all ${plan.highlighted
                                    ? 'bg-blue-900 text-white shadow-2xl shadow-blue-900/30 scale-105 z-10'
                                    : 'bg-white border border-slate-200 hover:shadow-xl'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-emerald-500 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full">
                                        Le plus populaire
                                    </span>
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.highlighted ? 'bg-white/20' : 'bg-blue-50'
                                }`}>
                                <plan.icon size={28} className={plan.highlighted ? 'text-white' : 'text-blue-900'} />
                            </div>

                            <h3 className={`text-2xl font-black mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                                {plan.description}
                            </p>

                            <div className="mb-8">
                                <span className={`text-5xl font-black ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.price.includes('devis') ? '' : '€'}{plan.price}
                                </span>
                                <span className={plan.highlighted ? 'text-blue-200' : 'text-slate-500'}>
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3">
                                        <Check size={18} className={plan.highlighted ? 'text-emerald-400' : 'text-emerald-500'} />
                                        <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-slate-600'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/login"
                                className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${plan.highlighted
                                        ? 'bg-white text-blue-900 hover:bg-blue-50'
                                        : 'bg-slate-900 text-white hover:bg-blue-900'
                                    }`}
                            >
                                {plan.cta}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ Teaser */}
                <div className="text-center mt-20">
                    <p className="text-slate-500">
                        Des questions ? <Link href="/login" className="text-blue-900 font-bold hover:underline">Contactez notre équipe commerciale</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
