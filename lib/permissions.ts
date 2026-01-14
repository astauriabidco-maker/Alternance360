
export const PERMISSIONS = {
    // Contract Management
    CONTRACT_READ: 'CONTRACT_READ',
    CONTRACT_WRITE: 'CONTRACT_WRITE', // Create/Edit unauthorized contracts
    CONTRACT_DELETE: 'CONTRACT_DELETE',

    // Pedagogical Management (TSF)
    TSF_READ: 'TSF_READ',
    TSF_VALIDATE: 'TSF_VALIDATE', // Validate assessment & lock TSF (CRITICAL)
    TSF_UNLOCK: 'TSF_UNLOCK',     // Unlock a validated TSF (SUPER CRITICAL)

    // User Management
    USER_READ: 'USER_READ',
    USER_WRITE: 'USER_WRITE',
    ROLE_MANAGE: 'ROLE_MANAGE',   // Manage RBAC roles

    // Governance
    AUDIT_READ: 'AUDIT_READ',     // View Governance Dashboard
    AUDIT_GENERATE: 'AUDIT_GENERATE' // Create Audit Sessions
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(user: any, permission: Permission): boolean {
    if (!user) return false

    // 1. Super Admin has all power
    if (user.role === 'super_admin') return true

    // 2. Admin (Legacy) has most power, except maybe super specific stuff
    // For transition, let's say Admin has everything too, or almost
    if (user.role === 'admin') return true

    // 3. Custom Role Check
    if (user.customRole?.permissions) {
        try {
            const perms = JSON.parse(user.customRole.permissions)
            return perms.includes(permission)
        } catch (e) {
            return false
        }
    }

    // 4. Default fallbacks for standard roles (backward compatibility)
    // Formateurs can read contracts linked to them (handled by query filters usually)
    // but here we check functional permission
    if (user.role === 'formateur') {
        const formateurPerms = [PERMISSIONS.TSF_READ, PERMISSIONS.CONTRACT_READ]
        if (formateurPerms.includes(permission as any)) return true
    }

    return false
}

// Security Helper to be used in Server Actions
export function requirePermission(user: any, permission: Permission) {
    if (!hasPermission(user, permission)) {
        throw new Error(`Access Denied: Missing permission ${permission}`)
    }
}
