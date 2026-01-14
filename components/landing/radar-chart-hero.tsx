'use client'

import React from 'react'

const RadarChartHero = () => {
    // Points calculés pour un pentagone (5 blocs de compétences)
    // Niveau Initial (Bleu clair) vs Cible (Bleu foncé)
    const initialLevel = "60,150 180,110 220,190 140,240 80,200"
    const targetLevel = "150,50 250,120 210,240 90,240 50,120"

    return (
        <div className="relative w-full max-w-md mx-auto p-4 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="absolute top-4 left-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Progression RNCP</span>
            </div>

            <svg viewBox="0 0 300 300" className="w-full h-auto drop-shadow-sm mt-4">
                {/* Cercles concentriques de fond */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <polygon
                        key={i}
                        points="150,50 250,120 210,240 90,240 50,120"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        transform={`scale(${scale})`}
                        style={{ transformOrigin: 'center' }}
                    />
                ))}

                {/* Axes */}
                <line x1="150" y1="150" x2="150" y2="50" stroke="#cbd5e1" strokeDasharray="4" />
                <line x1="150" y1="150" x2="250" y2="120" stroke="#cbd5e1" strokeDasharray="4" />
                <line x1="150" y1="150" x2="210" y2="240" stroke="#cbd5e1" strokeDasharray="4" />
                <line x1="150" y1="150" x2="90" y2="240" stroke="#cbd5e1" strokeDasharray="4" />
                <line x1="150" y1="150" x2="50" y2="120" stroke="#cbd5e1" strokeDasharray="4" />

                {/* Zone Niveau Initial */}
                <polygon
                    points={initialLevel}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    className="animate-pulse"
                />

                {/* Zone Cible Finale */}
                <polygon
                    points={targetLevel}
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />

                {/* Labels */}
                <text x="150" y="35" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">Bloc 1</text>
                <text x="270" y="125" textAnchor="start" className="text-[10px] font-bold fill-slate-500">Bloc 2</text>
                <text x="220" y="260" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">Bloc 3</text>
                <text x="80" y="260" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">Bloc 4</text>
                <text x="30" y="125" textAnchor="end" className="text-[10px] font-bold fill-slate-500">Bloc 5</text>
            </svg>

            {/* Légende */}
            <div className="flex justify-center gap-4 mt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500/20 border border-blue-500 rounded-sm"></div>
                    <span className="text-xs text-slate-600 font-medium">Positionnement</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-900 rounded-sm"></div>
                    <span className="text-xs text-slate-600 font-medium">Cible RNCP</span>
                </div>
            </div>
        </div>
    )
}

export default RadarChartHero
