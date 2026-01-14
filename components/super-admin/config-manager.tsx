"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Save,
    Shield,
    Zap,
    Bell,
    Database,
    Lock,
    RefreshCw,
    CheckCircle2,
    Server,
    HardDrive,
    Activity
} from "lucide-react"
import { savePlatformConfig } from "@/app/actions/super-admin"
import { checkSystemHealth, SystemHealth } from "@/app/actions/system-health"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ConfigManagerProps {
    settings: any[]
}

export function ConfigManager({ settings }: ConfigManagerProps) {
    const [configs, setConfigs] = useState<any>(
        settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value === 'true' }), {})
    )
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [isLoadingHealth, setIsLoadingHealth] = useState(false)

    const fetchHealth = async () => {
        setIsLoadingHealth(true)
        try {
            const data = await checkSystemHealth()
            setHealth(data)
            toast.success("État du système actualisé")
        } catch (error) {
            toast.error("Impossible de récupérer l'état du système")
        } finally {
            setIsLoadingHealth(false)
        }
    }

    useEffect(() => {
        fetchHealth()
    }, [])

    const handleToggle = async (key: string, checked: boolean) => {
        setConfigs((prev: any) => ({ ...prev, [key]: checked }))
        try {
            await savePlatformConfig(key, checked.toString())
            toast.success("Configuration mise à jour")
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde")
            setConfigs((prev: any) => ({ ...prev, [key]: !checked }))
        }
    }

    const sections = [
        {
            title: "Sécurité & Accès",
            icon: <Shield className="w-5 h-5 text-rose-500" />,
            items: [
                { key: "maintenance_mode", label: "Mode Maintenance Global", desc: "Désactive l'accès à toutes les instances CFA sauf Super-Admin." },
                { key: "self_registration", label: "Auto-Inscription", desc: "Permet aux nouveaux utilisateurs de créer un compte sans invitation." }
            ]
        },
        {
            title: "Performance & Système",
            icon: <Zap className="w-5 h-5 text-amber-500" />,
            items: [
                { key: "audit_verbose", label: "Audit Log Verbeux", desc: "Enregistre chaque lecture de donnée en plus des écritures." },
                { key: "cache_enabled", label: "Cache de Couche 2", desc: "Optimise les performances sur les grosses bases de données." }
            ]
        },
        {
            title: "Notifications",
            icon: <Bell className="w-5 h-5 text-blue-500" />,
            items: [
                { key: "email_notifications", label: "Notifications Email", desc: "Envoi automatique des relevés et alertes par email." },
                { key: "sms_alerts", label: "Alertes SMS Critique", desc: "Envoi de SMS pour les échecs de paiement importants." }
            ]
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                {sections.map((section, idx) => (
                    <Card key={idx} className="border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-3">
                            {section.icon}
                            <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs">{section.title}</h3>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            {section.items.map((item) => (
                                <div key={item.key} className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-900 leading-none">{item.label}</div>
                                        <div className="text-xs text-slate-400 font-medium max-w-[250px]">{item.desc}</div>
                                    </div>
                                    <Switch
                                        checked={configs[item.key] || false}
                                        onCheckedChange={(checked: boolean) => handleToggle(item.key, checked)}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <Card className="bg-slate-900 text-white border-none rounded-[2rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Database size={120} />
                    </div>
                    <CardContent className="p-10 space-y-8 relative">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Badge className={cn("bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold", health?.system.status === 'CRITICAL' && "bg-rose-500/20 text-rose-400 border-rose-500/30")}>
                                    Système Vital
                                </Badge>
                                {health && (
                                    <span className="text-[10px] font-mono text-slate-500">
                                        Last Check: {new Date(health.lastUpdated).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">État de la Plateforme.</h2>
                            <p className="text-slate-400 font-medium">Monitoring en temps réel des services critiques.</p>
                        </div>

                        {!health ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-12 bg-white/5 rounded-2xl" />
                                <div className="h-12 bg-white/5 rounded-2xl" />
                                <div className="h-12 bg-white/5 rounded-2xl" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Database Status */}
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Database size={16} className="text-slate-300" />
                                            <span className="font-bold text-sm text-slate-300">Base de Données</span>
                                        </div>
                                        <Badge variant="outline" className={cn("border-0 font-bold", health.database.status === 'OK' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                                            {health.database.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>PostgreSQL Primary</span>
                                        <span className={cn("font-mono", health.database.latency > 100 ? "text-amber-400" : "text-emerald-400")}>
                                            {health.database.latency}ms latency
                                        </span>
                                    </div>
                                </div>

                                {/* System Load */}
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Server size={16} className="text-slate-300" />
                                            <span className="font-bold text-sm text-slate-300">Charge Système (CPU)</span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400">{health.system.load}% Load</div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500",
                                                health.system.status === 'CRITICAL' ? 'bg-rose-500' :
                                                    health.system.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                                            )}
                                            style={{ width: `${Math.min(health.system.load * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Memory Usage */}
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <HardDrive size={16} className="text-slate-300" />
                                            <span className="font-bold text-sm text-slate-300">Mémoire (RAM)</span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400">{health.system.memoryUsage}% Used</div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500",
                                                health.system.memoryUsage > 90 ? 'bg-rose-500' :
                                                    health.system.memoryUsage > 75 ? 'bg-amber-500' : 'bg-blue-500'
                                            )}
                                            style={{ width: `${health.system.memoryUsage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={fetchHealth}
                            disabled={isLoadingHealth}
                            className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black gap-2 transition-all active:scale-95"
                        >
                            <RefreshCw size={18} className={cn(isLoadingHealth && "animate-spin")} />
                            {isLoadingHealth ? "Vérification..." : "Forcer la Synchronisation"}
                        </Button>
                    </CardContent>
                </Card>

                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight mb-1">Protection Système</h4>
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">Certaines modifications peuvent impacter l'accès de milliers d'utilisateurs. Les changements sont appliqués instantanément.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
