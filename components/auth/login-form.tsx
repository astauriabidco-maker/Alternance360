'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface LoginFormProps {
    primaryColor: string
}

export function LoginForm({ primaryColor }: LoginFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: true,
                redirectTo: '/login' // The middleware will then handle the specific dashboard redirect
            })

            if (result?.error) {
                setError("Identifiants incorrects. Veuillez réessayer.")
                toast.error("Échec de la connexion")
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la connexion.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Professionnel</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                        placeholder="nom@cfa.fr"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                    <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Oublié ?</a>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: loading ? '#94a3b8' : primaryColor }}
                className="w-full text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Se connecter"}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-black text-slate-400 tracking-widest"><span className="bg-white px-4">Accès rapide</span></div>
            </div>

            <button
                type="button"
                className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
                <Mail size={18} />
                Lien magique (Tuteurs)
            </button>

            <div className="text-center mt-6">
                <p className="text-slate-500 text-sm font-medium">
                    Pas encore de compte ?{' '}
                    <a href="/register" className="font-bold text-blue-600 hover:underline">
                        Créer mon espace CFA
                    </a>
                </p>
            </div>
        </form>
    )
}
