'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User, Building2, AlertCircle, ArrowRight } from 'lucide-react'
import { registerTenant } from '@/app/actions/register-tenant'
import { toast } from 'sonner'

export function RegisterForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)

        try {
            const res = await registerTenant(formData)

            if (res.error) {
                setError(typeof res.error === 'string' ? res.error : "Une erreur est survenue")
                toast.error("Échec de l'inscription")
                setLoading(false)
            } else if (res.success) {
                toast.success("Inscription réussie !")
                router.push('/login?registered=true')
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.")
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nom du CFA</label>
                <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        name="cfaName"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                        placeholder="Ex: CFA des Métiers"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Prénom</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            name="firstName"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                            placeholder="Jean"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nom</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            name="lastName"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                            placeholder="Dupont"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Admin</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        name="adminEmail"
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                        placeholder="admin@cfa.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Mot de passe</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-blue-900 transition-all text-slate-900 placeholder:text-slate-400"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-400"
            >
                {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                        Créer mon espace
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>
    )
}
