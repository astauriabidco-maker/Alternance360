import { RegisterForm } from "@/components/auth/register-form"
import { Anchor, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side: Form */}
            <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
                <div className="max-w-md w-full mx-auto">
                    <Link href="/" className="inline-flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Anchor className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                            Alternance<span className="text-emerald-500">360</span>
                        </span>
                    </Link>

                    <h2 className="text-4xl font-black text-slate-900 mb-2 leading-tight">Créez votre <br /><span className="text-blue-600">Centre de Commandement.</span></h2>
                    <p className="text-slate-500 mb-10 font-medium">Rejoignez les CFA qui digitalisent leur suivi qualité.</p>

                    <RegisterForm />

                    <div className="text-center mt-8">
                        <p className="text-slate-500 text-sm font-medium">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="font-bold text-blue-600 hover:underline">
                                Me connecter
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <ShieldCheck size={18} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight">
                            Essai gratuit de 14 jours sans engagement. <br />
                            Pas de carte bancaire requise.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual */}
            <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900"></div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center p-20">
                    <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-8 backdrop-blur-md">
                            <Sparkles size={16} />
                            Inclus dans votre essai
                        </div>

                        <h3 className="text-3xl font-black text-white mb-8 leading-tight">
                            Tout ce dont vous avez besoin pour piloter votre CFA.
                        </h3>

                        <div className="space-y-6">
                            {[
                                "Import Illimité de Référentiels RNCP",
                                "Génération automatique des TSF",
                                "Coffre-fort numérique de preuves",
                                "Tableau de bord conformité Qualiopi"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-300 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Social Proof Mini Card */}
                        <div className="mt-12 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800"></div>
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-white">
                                    +2500 Apprentis
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                "Alternance360 a transformé notre gestion quotidienne. Nos auditeurs sont ravis."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
