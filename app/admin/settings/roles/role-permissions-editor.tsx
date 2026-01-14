'use client'

import { useState } from 'react'
import { PERMISSIONS } from '@/lib/permissions'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CardContent } from "@/components/ui/card"

export function RolePermissionsEditor({ role, onSave }: { role: any, onSave: any }) {
    const [permissions, setPermissions] = useState<string[]>(() => {
        try {
            return JSON.parse(role.permissions || '[]')
        } catch {
            return []
        }
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const togglePermission = (perm: string) => {
        setPermissions(prev =>
            prev.includes(perm)
                ? prev.filter(p => p !== perm)
                : [...prev, perm]
        )
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await onSave(role.id, permissions)
            toast.success("Permissions mises à jour")
            router.refresh()
        } catch (e) {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setIsLoading(false)
        }
    }

    // Grouping Permissions for UI
    const groups = {
        "Gestion Contrats": [PERMISSIONS.CONTRACT_READ, PERMISSIONS.CONTRACT_WRITE, PERMISSIONS.CONTRACT_DELETE],
        "Pédagogie (TSF)": [PERMISSIONS.TSF_READ, PERMISSIONS.TSF_VALIDATE, PERMISSIONS.TSF_UNLOCK],
        "Gestion Équipe": [PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE, PERMISSIONS.ROLE_MANAGE],
        "Gouvernance": [PERMISSIONS.AUDIT_READ, PERMISSIONS.AUDIT_GENERATE]
    }

    return (
        <CardContent className="p-0">
            <div className="p-6 bg-white space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                    {Object.entries(groups).map(([groupName, perms]) => (
                        <div key={groupName} className="space-y-3">
                            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-sm uppercase tracking-wide">{groupName}</h4>
                            <div className="space-y-2">
                                {perms.map(perm => (
                                    <div key={perm} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${role.id}-${perm}`}
                                            checked={permissions.includes(perm)}
                                            onCheckedChange={() => togglePermission(perm)}
                                            className="data-[state=checked]:bg-indigo-600 border-slate-300"
                                        />
                                        <label
                                            htmlFor={`${role.id}-${perm}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 block py-1 cursor-pointer select-none"
                                        >
                                            {perm}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2"
                    >
                        {isLoading ? 'Sauvegarde...' : <><Save size={16} /> Enregistrer les permissions</>}
                    </Button>
                </div>
            </div>
        </CardContent>
    )
}
