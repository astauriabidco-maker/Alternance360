'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(searchParams.get('error'))

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            })

            console.log(" [LOGIN] signIn response:", res)

            if (res?.error) {
                setError("Email ou mot de passe incorrect")
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError("Une erreur est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-6">
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1" htmlFor="email">
                    Identifiant professionnel
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Mail size={18} />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nom@cfa-ecole.fr"
                        required
                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1" htmlFor="password">
                    Mot de passe
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <KeyRound size={18} />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            <button
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} /> Connexion...
                    </>
                ) : (
                    <>
                        Se connecter
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="pt-4 text-center border-t border-slate-50">
                <a href="#" className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
                    Problème d'accès ? Contactez l'administrateur CFA
                </a>
            </div>
        </form>
    )
}
