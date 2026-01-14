'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuditLoginPage() {
    const [token, setToken] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!token.trim()) {
            setError('Veuillez entrer un code d\'accès valide.')
            return
        }
        router.push(`/audit/${token}/dashboard`)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Portail de Conformité</h1>
                    <p className="text-indigo-100 text-sm font-medium mt-2">Accès Auditeur Qualiopi Sécurisé</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
                        <Lock size={16} className="shrink-0 mt-0.5" />
                        <p>Cette session est temporaire et tracée. Toutes vos actions sont enregistrées dans le journal d'audit.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Code d'accès sécurisé</label>
                            <Input
                                placeholder="Entrez votre token de session..."
                                className="h-12 rounded-xl text-lg font-mono tracking-widest text-center uppercase"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

                        <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 group transition-all">
                            Accéder au Portail <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </div>
            </motion.div>

            <p className="mt-8 text-slate-400 text-xs font-medium text-center max-w-sm">
                Propulsé par <strong>Alternance 360</strong>. <br />Plateforme de gestion de l'alternance conforme au Référentiel National Qualité.
            </p>
        </div>
    )
}
