'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, MoreHorizontal, Layout, User } from 'lucide-react'

export function ProductMockup() {
    return (
        <div className="relative group">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700"></div>

            {/* Main Window */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
                {/* Header/Title Bar */}
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        <Shield className="text-blue-600" size={14} />
                        <span className="text-[10px] font-bold text-slate-500">app.alternance360.fr</span>
                    </div>
                    <MoreHorizontal className="text-slate-300" size={20} />
                </div>

                {/* Content Area */}
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900">Dashboard de Suivi</h4>
                            <p className="text-xs text-slate-500">Contrôle de conformité Qualiopi</p>
                        </div>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                    <User size={14} className="text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alertes Rupture</div>
                            <div className="text-2xl font-black text-blue-900">03</div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Livrets Prêts</div>
                            <div className="text-2xl font-black text-emerald-600">84%</div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {[
                            { name: 'TSF Planning', status: 'Complété' },
                            { name: 'Signature Livret', status: 'En attente' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Layout size={14} className="text-blue-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                                </div>
                                <CheckCircle2 size={16} className={item.status === 'Complété' ? 'text-emerald-500' : 'text-slate-200'} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Element 1 */}
            <motion.div
                className="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400">Qualiopi Opt-in</div>
                        <div className="text-xs font-black text-slate-900 font-sans">Audit Validé</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
