'use client'

import React from 'react'
import { motion } from 'framer-motion'

const logos = [
    'CFA Descartes', 'IFA Marcel Sauvage', 'CFA BTP 77', 'Groupe IGS', 'AFORP',
    'CFA Descartes', 'IFA Marcel Sauvage', 'CFA BTP 77', 'Groupe IGS', 'AFORP'
]

export function LogoMarquee() {
    return (
        <div className="w-full py-12 bg-white/50 backdrop-blur-sm border-y border-slate-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    L'excellence pédagogique au service des plus grands centres
                </p>
            </div>

            <div className="relative flex overflow-x-hidden">
                <motion.div
                    className="flex items-center gap-12 whitespace-nowrap py-4"
                    animate={{
                        x: [0, -1000]
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {logos.map((name, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-8 group grayscale hover:grayscale-0 transition-all duration-500"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200/50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                <span className="text-xl font-black text-blue-900">{name.charAt(0)}</span>
                            </div>
                            <span className="text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">{name}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Second set for seamless loop */}
                <motion.div
                    className="flex items-center gap-12 whitespace-nowrap py-4 absolute top-0"
                    initial={{ x: 1000 }}
                    animate={{
                        x: [1000, 0]
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {logos.map((name, i) => (
                        <div
                            key={`dup-${i}`}
                            className="flex items-center gap-3 px-8 group grayscale hover:grayscale-0 transition-all duration-500"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-slate-200/50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                <span className="text-xl font-black text-blue-900">{name.charAt(0)}</span>
                            </div>
                            <span className="text-lg font-bold text-slate-400 group-hover:text-slate-900 transition-colors">{name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
