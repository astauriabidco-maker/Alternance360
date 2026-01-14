import { auth } from '@/auth'
import db from '@/lib/db'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function AdminUsersPage() {
    const session = await auth()
    if (!session?.user?.id) redirect('/login')

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'formateur')) {
        return <div>Accès refusé</div>
    }

    const tenantId = session.user.tenantId

    const users = await db.user.findMany({
        where: tenantId ? { tenantId } : {}, // Super-admins see everyone if tenantId is null
        orderBy: { createdAt: 'desc' }
    })

    const formattedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        companyName: u.companyName,
        created_at: u.createdAt.toISOString()
    }))

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black">Gestion des Utilisateurs</h1>
                <SignOutButton />
            </div>
            <UserManagement users={formattedUsers} />
        </div>
    )
}
