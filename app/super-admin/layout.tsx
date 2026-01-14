import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SuperAdminSidebar } from "@/components/super-admin/sidebar"

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || session.user.role !== "super_admin") {
        redirect("/login")
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <SuperAdminSidebar />
            <main className="flex-1 overflow-y-auto p-12 lg:p-16">
                {children}
            </main>
        </div>
    )
}
