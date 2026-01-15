"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    Activity,
    Palette,
    Cpu
} from "lucide-react"
import { savePlatformConfig } from "@/app/actions/super-admin"
import { checkSystemHealth, SystemHealth } from "@/app/actions/system-health"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ConfigManagerProps {
    settings: any[]
}

export function ConfigManager({ settings }: ConfigManagerProps) {
    // Group settings by their 'group' field
    const groupedSettings = settings.reduce((acc: any, s: any) => {
        const group = s.group || 'GENERAL'
        if (!acc[group]) acc[group] = []
        acc[group].push(s)
        return acc
    }, {})

    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [isLoadingHealth, setIsLoadingHealth] = useState(false)
    const [loadingSave, setLoadingSave] = useState<string | null>(null)

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

    const handleSave = async (key: string, value: string, group: string, isSecret: boolean) => {
        setLoadingSave(key)
        try {
            await savePlatformConfig(key, value, group, isSecret)
            toast.success("Paramètre sauvegardé")
        } catch (error) {
            toast.error("Erreur")
        } finally {
            setLoadingSave(null)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="BRANDING" className="w-full">
                    <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 mb-6 h-auto flex-wrap">
                        <TabsTrigger value="BRANDING" className="rounded-xl px-4 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white gap-2">
                            <Palette size={16} /> Identité
                        </TabsTrigger>
                        <TabsTrigger value="SECURITY" className="rounded-xl px-4 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white gap-2">
                            <Shield size={16} /> Sécurité
                        </TabsTrigger>
                        <TabsTrigger value="TECH" className="rounded-xl px-4 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white gap-2">
                            <Cpu size={16} /> Technical
                        </TabsTrigger>
                    </TabsList>

                    {['BRANDING', 'SECURITY', 'TECH'].map(group => (
                        <TabsContent key={group} value={group}>
                            <Card className="border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <h3 className="font-black text-slate-900 text-xl mb-4">Paramètres {group}</h3>

                                    {groupedSettings[group]?.map((setting: any) => (
                                        <div key={setting.key} className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="font-bold text-slate-700">{setting.key}</Label>
                                                {setting.isSecret && <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">Secret</Badge>}
                                            </div>

                                            <div className="flex gap-4">
                                                <Input
                                                    defaultValue={setting.value}
                                                    type={setting.isSecret ? "password" : "text"}
                                                    className="bg-white border-slate-200 rounded-xl"
                                                    onChange={(e) => {
                                                        // In a real form we'd track state, here simplified for immediate save on blur/enter or adding a save button
                                                        // For UX, let's just make the button save the current value from the input ref? 
                                                        // Simplified: We pass the value to the button handler via a local form or individual state.
                                                        // Given the architectural constraint, let's use a small form for each item or just blur.
                                                    }}
                                                    onBlur={(e) => handleSave(setting.key, e.target.value, group, setting.isSecret)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={loadingSave === setting.key}
                                                    className="shrink-0"
                                                >
                                                    {loadingSave === setting.key ? <RefreshCw className="animate-spin" /> : <Save size={18} className="text-slate-400" />}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {!groupedSettings[group] && <p className="text-slate-400 italic">Aucun paramètre dans ce groupe.</p>}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <div className="space-y-6">
                {/* Monitoring Card - Kept the same as before */}
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
            </div>
        </div>
    )
}
