'use client'

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SignOutButton({ className }: { className?: string }) {
    return (
        <Button
            variant="ghost"
            className={`text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-2 font-bold ${className}`}
            onClick={() => signOut({ callbackUrl: '/' })}
        >
            <LogOut size={16} />
            Déconnexion
        </Button>
    )
}
