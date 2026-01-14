'use server'

import prisma from "@/lib/db"
import { auth } from "@/auth"

export async function logAuditEvent(action: string, entityType?: string, entityId?: string, details?: any) {
    const session = await auth()
    if (!session?.user) return null

    return await (prisma as any).auditLog.create({
        data: {
            action,
            entityType,
            entityId,
            actorId: session.user.id,
            tenantId: session.user.tenantId,
            details: details ? JSON.stringify(details) : null
        }
    })
}

export async function logLoginAttempt(email: string, success: boolean, ip?: string) {
    return await (prisma as any).auditLog.create({
        data: {
            action: success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
            entityType: 'User',
            actorId: email, // Tracking by email since user might not exist
            details: JSON.stringify({ ip, timestamp: new Date() })
        }
    })
}

// ==========================================
// COMPLIANCE PORTAL LOGIC (AUDITOR ACCESS)
// ==========================================

import { randomBytes } from 'crypto'
import { addDays } from 'date-fns'
import db from '@/lib/db' // Ensure we use the same db instance

export type AuditSessionData = {
    id: string
    token: string
    scope: string[]
    expiresAt: Date
    tenantId: string
}

export type AuditData = {
    session: AuditSessionData
    apprentices: any[]
}

// 1. Create a secure audit session (Admin only)
export async function createAuditSession(apprenticeIds: string[], validityDays: number = 2) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
        throw new Error("Unauthorized: Only Admins can generate audit tokens.")
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = addDays(new Date(), validityDays)

    const auditSession = await (db as any).auditSession.create({
        data: {
            token,
            scope: JSON.stringify(apprenticeIds),
            expiresAt,
            tenantId: session.user.tenantId!,
            createdBy: session.user.id
        }
    })

    return {
        url: `/audit/${token}/dashboard`,
        expiresAt
    }
}

// 2. Verify Token & Get Session Context
export async function verifyAuditToken(token: string): Promise<AuditSessionData | null> {
    const session = await (db as any).auditSession.findUnique({
        where: { token }
    })

    if (!session || new Date() > session.expiresAt) {
        return null
    }

    return {
        id: session.id,
        token: session.token,
        scope: JSON.parse(session.scope),
        expiresAt: session.expiresAt,
        tenantId: session.tenantId
    }
}

// 3. Fetch Read-Only Data (Auditor View)
export async function getAuditData(token: string): Promise<AuditData> {
    const session = await verifyAuditToken(token)
    if (!session) throw new Error("Invalid or expired token")

    // Log the access (Top Level)
    await logAuditAccess(session.id, 'DASHBOARD_ACCESS', 'Auditor accessed the main dashboard')

    // Fetch permitted apprentices only
    const apprentices = await db.user.findMany({
        where: {
            id: { in: session.scope },
            tenantId: session.tenantId
        },
        include: {
            contracts: {
                include: {
                    referentiel: true,
                    initialAssessments: true,
                    livrets: true,
                    milestones: true
                }
            }
        }
    })

    return {
        session,
        apprentices
    }
}

// 4. Log specific document access
export async function logAuditAccess(sessionId: string, resource: string, details?: string) {
    await (db as any).auditAccessLog.create({
        data: {
            sessionId,
            resource,
            details
        }
    })
}
