import { auth } from '@/auth'
import db from '@/lib/db'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, MapPin, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function SharedCalendarPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const contract = await db.contract.findFirst({
        where: { userId: session.user.id },
        include: { periodes: { orderBy: { startDate: 'asc' } } }
    })

    if (!contract) {
        return <div className="p-20 text-center">Aucun contrat trouvé.</div>
    }

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans">
            <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <CalendarIcon className="text-indigo-600" size={32} />
                Calendrier Alternance
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contract.periodes.map((p) => {
                    const isCFA = p.label.toLowerCase().includes('cfa')
                    return (
                        <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
                            <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${isCFA ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {isCFA ? <GraduationCap size={24} /> : <MapPin size={24} />}
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{p.label}</h3>
                            <div className="flex flex-col text-sm text-slate-500 font-medium">
                                <span>Du {format(new Date(p.startDate), 'd MMMM', { locale: fr })}</span>
                                <span>Au {format(new Date(p.endDate), 'd MMMM yyyy', { locale: fr })}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
