'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Compass, Users, Bell, Download, Sparkles, Shield, BarChart3 } from 'lucide-react'
import { FadeIn } from '../ui/fade-in'

const features = [
    {
        title: "Livret 100% Digital",
        description: "Dites adieu aux livrets papier et aux PDF statiques. Un suivi vivant, accessible partout.",
        icon: BookOpen,
        color: "from-indigo-500 to-blue-600",
        className: "md:col-span-2 md:row-span-2",
        image: true
    },
    {
        title: "Validation Mobile",
        description: "Signatures et visas en 3clics pour les tuteurs en entreprise.",
        icon: Users,
        color: "from-emerald-500 to-teal-500",
        className: "md:col-span-1 md:row-span-2",
        dark: true
    },
    {
        title: "Conformité Qualiopi",
        description: "Collecte automatique des preuves pour vos audits.",
        icon: Shield,
        color: "from-blue-500 to-cyan-500",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        title: "Alertes Rupture",
        description: "Surveillance proactive des retards de complétion.",
        icon: Bell,
        color: "from-amber-400 to-orange-500",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        title: "Preuve Opposable",
        description: "Génération automatique du livret certifié pour les financeurs.",
        icon: Download,
        color: "from-rose-500 to-red-600",
        className: "md:col-span-2 md:row-span-1"
    }
]

export function BentoGrid() {
    return (
        <section id="features" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Sparkles size={16} className="text-emerald-500" />
                            Innovation Pédagogique
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            Une interface pensée pour la <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600">Performance</span>.
                        </h2>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6 auto-rows-[200px]">
                    {features.map((feature, i) => (
                        <FadeIn
                            key={i}
                            delay={i * 0.1}
                            className={`${feature.className} group`}
                        >
                            <div className={`relative h-full w-full rounded-[2.5rem] p-8 overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-100 flex flex-col justify-end ${feature.dark ? 'bg-slate-900 text-white' : 'bg-white'}`}>

                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>

                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon size={24} className="text-white" />
                                </div>

                                <div>
                                    <h3 className={`text-2xl font-black mb-3 ${feature.dark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                                    <p className={`text-sm leading-relaxed ${feature.dark ? 'text-slate-400' : 'text-slate-500'}`}>{feature.description}</p>
                                </div>

                                {feature.image && (
                                    <div className="absolute top-8 right-8 hidden lg:block opacity-20 group-hover:opacity-40 transition-opacity">
                                        <BarChart3 size={120} className="text-blue-900" />
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
