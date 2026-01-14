'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'
import { User, Building2, Phone, UserCircle, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const initialState = {
    message: '',
    error: '',
    success: false
}

type ProfileData = {
    first_name: string | null
    last_name: string | null
    phone: string | null
    company_name: string | null
    tutor_name: string | null
}

export function ProfileForm({ data }: { data: ProfileData | null }) {
    const [state, formAction, isPending] = useActionState(updateProfile, initialState)

    return (
        <form action={formAction} className="space-y-8">
            {state.error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{state.error}</p>
                </div>
            )}

            {state.success && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <p>{state.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations Personnelles */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <UserCircle className="text-indigo-500" size={20} />
                        Informations Personnelles
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                name="first_name"
                                defaultValue={data?.first_name || ''}
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                name="last_name"
                                defaultValue={data?.last_name || ''}
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                name="phone"
                                defaultValue={data?.phone || ''}
                                type="tel"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Informations Entreprise */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Building2 className="text-indigo-500" size={20} />
                        Entreprise d'accueil
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nom de l'entreprise</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                name="company_name"
                                defaultValue={data?.company_name || ''}
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Maître d'apprentissage</label>
                        <div className="relative">
                            <UserCircle className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                name="tutor_name"
                                defaultValue={data?.tutor_name || ''}
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Enregistrer les modifications
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
