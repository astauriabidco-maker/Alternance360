import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Clock, ChevronRight, FileJson } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Referentiel {
    id: string
    code_rncp: string
    title: string
    created_at: string
}

interface ReferentielListProps {
    referentiels: Referentiel[]
}

export function ReferentielList({ referentiels }: ReferentielListProps) {
    if (!referentiels || referentiels.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                    <FileJson size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun référentiel</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">Commencez par importer votre premier référentiel RNCP pour configurer vos parcours de formation.</p>
                <Link href="/admin/import">
                    <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-2xl font-bold shadow-lg shadow-blue-500/20 gap-2">
                        <Plus size={18} /> Importer un RNCP
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {referentiels.map((ref) => (
                <div key={ref.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="p-8 flex-1">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <div className="text-[10px] font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                                RNCP {ref.code_rncp}
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                            {ref.title}
                        </h3>

                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <Clock size={12} />
                            Importé le {format(new Date(ref.created_at), 'dd MMM yyyy', { locale: fr })}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                        <Button variant="ghost" className="w-full justify-between h-10 px-4 rounded-xl text-slate-600 font-bold hover:bg-white hover:text-blue-600 transition-all">
                            Voir le détail <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            ))}

            {/* Add New Card */}
            <Link href="/admin/import" className="group h-full">
                <div className="flex flex-col items-center justify-center h-full min-h-[240px] rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                    <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
                        <Plus size={28} />
                    </div>
                    <span className="mt-4 block text-sm font-black text-slate-900">Ajouter un référentiel</span>
                    <p className="mt-1 text-xs text-slate-400 font-bold uppercase tracking-widest">Import JSON Qualiopi</p>
                </div>
            </Link>
        </div>
    )
}

