'use client'

import { useActionState, useState } from 'react'
import { uploadProof } from './actions'
import { Plus, CloudUpload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const initialState = {
    message: '',
    error: '',
    success: false
}

export function UploadForm() {
    const [state, formAction, isPending] = useActionState(uploadProof, initialState)
    const [fileName, setFileName] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name)
        }
    }

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 sticky top-10">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="text-indigo-600" size={24} />
                Déposer une preuve
            </h2>

            <form action={formAction} className="space-y-6">
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

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Titre de l'activité
                    </label>
                    <input
                        name="titre"
                        type="text"
                        placeholder="Ex: Maquettage Figma projet X"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Document (PDF ou Image)
                    </label>
                    <div className={`relative group border-2 border-dashed rounded-2xl transition-all p-8 text-center cursor-pointer ${fileName ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
                        <input
                            name="file"
                            type="file"
                            accept="image/*,application/pdf"
                            required
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <CloudUpload className={`mx-auto mb-2 transition-colors ${fileName ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-500'}`} size={32} />

                        {fileName ? (
                            <p className="text-sm font-bold text-indigo-700 truncate px-2">
                                {fileName}
                            </p>
                        ) : (
                            <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                                Cliquez ou glissez un fichier
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Envoi en cours...
                        </>
                    ) : (
                        "Envoyer la preuve"
                    )}
                </button>
            </form>
        </div>
    )
}
