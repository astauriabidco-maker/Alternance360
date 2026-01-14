import { auth } from "@/auth"
import db from "@/lib/db"
import { redirect } from "next/navigation"
import { Shield, Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PERMISSIONS } from "@/lib/permissions"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { RolePermissionsEditor } from "./role-permissions-editor"

// Server Action to Create Role
async function createRole(formData: FormData) {
    'use server'
    const session = await auth()
    if (!session?.user?.id || !session.user.tenantId) return

    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) return

    await db.role.create({
        data: {
            name,
            description,
            permissions: JSON.stringify([]),
            tenantId: session.user.tenantId
        }
    })
    revalidatePath('/admin/settings/roles')
}

// Server Action to Update Permissions
async function updateRolePermissions(roleId: string, permissions: string[]) {
    'use server'
    const session = await auth()
    if (!session?.user?.id) return

    await db.role.update({
        where: { id: roleId },
        data: { permissions: JSON.stringify(permissions) }
    })
    revalidatePath('/admin/settings/roles')
}

// Server Action to Delete Role
async function deleteRole(roleId: string) {
    'use server'
    const session = await auth()
    if (!session?.user?.id) return

    await db.role.delete({ where: { id: roleId } })
    revalidatePath('/admin/settings/roles')
}

export default async function RoleManagementPage() {
    const session = await auth()

    // Authorization check
    if (!session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
        redirect('/')
    }

    // Fetch roles - Super admins without a tenantId will see nothing or we could show all.
    // For now, let's just make it safe.
    const roles = session.user.tenantId
        ? await db.role.findMany({
            where: { tenantId: session.user.tenantId },
            include: { _count: { select: { users: true } } }
        })
        : []

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl space-y-8">
            <header>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Rôles & Permissions</h1>
                        <p className="text-slate-500 font-medium tracking-tight">Définissez des profils sur-mesure pour votre équipe.</p>
                    </div>
                </div>
            </header>

            {!session.user.tenantId && session.user.role === 'super_admin' && (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200">
                    <p className="font-bold">Note Super Admin : Vous n'êtes rattaché à aucun tenant. Les rôles ci-dessous sont ceux liés à votre profil actuel (aucun).</p>
                </div>
            )}

            {/* Create New Role */}
            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg">Créer un nouveau rôle</CardTitle>
                    <CardDescription>Ajoutez un profil (ex: "Secrétaire", "Responsable Pédago")</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <form action={createRole} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-2 w-full md:flex-1">
                            <label className="text-xs font-bold uppercase text-slate-500">Nom du Rôle</label>
                            <Input name="name" placeholder="ex: Responsable Pédagogique" required className="font-bold rounded-xl" />
                        </div>
                        <div className="grid gap-2 w-full md:flex-[2]">
                            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                            <Input name="description" placeholder="Peut valider les TSF mais pas créer de contrats..." className="rounded-xl" />
                        </div>
                        <Button type="submit" className="w-full md:w-auto bg-slate-900 text-white font-bold gap-2 rounded-xl">
                            <Plus size={18} /> Créer
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List Roles */}
            <div className="grid gap-6">
                {roles.length === 0 ? (
                    <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                        <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Aucun rôle personnalisé défini.</p>
                    </div>
                ) : (
                    roles.map((role) => (
                        <RoleEditor key={role.id} role={role} />
                    ))
                )}
            </div>
        </div>
    )
}

function RoleEditor({ role }: { role: any }) {
    return (
        <Card className="overflow-hidden border-slate-200 shadow-sm rounded-[2rem] transition-all hover:shadow-md group">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                        <Shield className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-slate-900 tracking-tight">{role.name}</h3>
                            <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                                {role._count.users} Utilisateurs
                            </Badge>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{role.description}</p>
                    </div>
                </div>
                <form action={deleteRole.bind(null, role.id)}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        disabled={role._count.users > 0}
                    >
                        <Trash2 size={18} />
                    </Button>
                </form>
            </div>

            <RolePermissionsEditor role={role} onSave={updateRolePermissions} />
        </Card>
    )
}
