import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import db from '@/lib/db'
import { ProfileForm } from './profile-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    })

    const profileData = user ? {
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        company_name: user.companyName,
        tutor_name: user.tutorName,
    } : null

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 font-sans">
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium text-sm mb-4 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Retour au tableau de bord
                </Link>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Profil</h1>
                <p className="text-slate-500 font-medium mt-1">Gérez vos informations personnelles et professionnelles</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50">
                <ProfileForm data={profileData} />
            </div>
        </div>
    )
}
