import { getActiveTenantBranding } from "@/app/actions/tenant"
import { LoginForm } from "@/components/auth/login-form"
import { Anchor, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default async function LoginPage() {
    const branding = await getActiveTenantBranding()

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Side: Form */}
            <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
                <div className="max-w-md w-full mx-auto">
                    <Link href="/" className="inline-flex items-center gap-3 mb-12">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10"
                            style={{ backgroundColor: branding.primaryColor }}
                        >
                            {branding.logoUrl ? (
                                <img src={branding.logoUrl} alt={branding.name} className="w-8 h-8 object-contain" />
                            ) : (
                                <Anchor className="text-white" size={24} />
                            )}
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {branding.name}
                        </span>
                    </Link>

                    <h2 className="text-4xl font-black text-slate-900 mb-2 leading-tight">Bienvenue.</h2>
                    <p className="text-slate-500 mb-10 font-medium">Connectez-vous pour accéder à votre livret d'apprentissage.</p>

                    <LoginForm primaryColor={branding.primaryColor} />

                    <div className="mt-12 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={18} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight">
                            Plateforme sécurisée conforme Qualiopi & RGPD. <br />
                            Vos données sont hébergées en France.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual */}
            <div className="hidden lg:block relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900"></div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 backdrop-blur-sm">
                        <ShieldCheck className="text-blue-400" size={40} />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-6 leading-tight">L'excellence au service de l'apprentissage.</h3>
                    <p className="text-lg text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Plus de 500 CFA utilisent déjà Alternance360 pour sécuriser leurs parcours de formation.
                    </p>

                    {/* Floating Branding Preview */}
                    <div className="mt-20 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl max-w-xs w-full text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                            <div>
                                <div className="text-xs font-bold text-slate-400">Instance Active</div>
                                <div className="text-sm font-black text-white">{branding.name}</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[65%]"></div></div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[40%]"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
