"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { TrendingUp, Users, Building2, Calendar } from "lucide-react"

interface EngagementChartsProps {
    data: {
        totalUsers: number
        activeContracts: number
        totalRevenue: number
        monthlyGrowth: string
    }
}

export function EngagementCharts({ data }: EngagementChartsProps) {
    // Dummy data for visual demonstration until we have real historical data
    const monthlyStats = [
        { month: 'J', users: 45, tenants: 2 },
        { month: 'F', users: 80, tenants: 3 },
        { month: 'M', users: 150, tenants: 5 },
        { month: 'A', users: 280, tenants: 8 },
        { month: 'M', users: 420, tenants: 12 },
        { month: 'J', users: 650, tenants: 18 },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-900 text-lg">Croissance Plateforme</h3>
                        <p className="text-slate-400 font-medium text-sm">Évolution des utilisateurs et instances sur 6 mois</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                        <TrendingUp size={16} />
                        {data.monthlyGrowth}
                    </div>
                </div>
                <CardContent className="p-8">
                    <div className="h-[200px] flex items-end justify-between gap-4">
                        {monthlyStats.map((stat, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-2 group cursor-pointer">
                                <div className="relative w-full">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(stat.users / 800) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                                        className="w-full bg-blue-600 rounded-t-xl opacity-90 group-hover:opacity-100 transition-opacity relative z-10"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(stat.tenants / 20) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 + 0.2, type: "spring" }}
                                        className="absolute bottom-0 w-full bg-slate-900 rounded-t-xl opacity-20"
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="font-black text-slate-300 text-xs">{stat.month}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <span className="text-xs font-bold text-slate-500">Utilisateurs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <span className="text-xs font-bold text-slate-500">Nouveaux Tenants</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-indigo-600 text-white border-none rounded-[2rem] shadow-xl shadow-indigo-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Users size={120} />
                    </div>
                    <CardContent className="p-8 relative">
                        <div className="mb-8">
                            <div className="text-indigo-200 font-bold mb-1">Utilisateurs Actifs</div>
                            <div className="text-5xl font-black tracking-tighter">{data.totalUsers}</div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-medium text-indigo-100">
                                <span>Apprentis</span>
                                <span className="font-bold text-white">78%</span>
                            </div>
                            <div className="w-full h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "78%" }}
                                    className="h-full bg-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 p-1">
                    <CardContent className="p-7 flex items-center justify-between">
                        <div>
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Contrats Signés</div>
                            <div className="text-3xl font-black text-slate-900">{data.activeContracts}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
