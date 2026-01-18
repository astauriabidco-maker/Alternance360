'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { createHash, randomBytes } from 'crypto'

export async function generateApiKeyAction(name: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("Unauthorized")
    }

    const tenantId = session.user.tenantId
    if (!tenantId) throw new Error("No tenant found for user")

    // Generate plain key
    const prefix = "cfa_live_"
    // 24 bytes = 48 hex chars. Prefix is 9 chars. Total ~57 chars.
    const randomPart = randomBytes(24).toString('hex')
    const plainKey = `${prefix}${randomPart}`

    // Hash the key using SHA-256
    const keyHash = createHash('sha256').update(plainKey).digest('hex')

    await db.apiKey.create({
        data: {
            name,
            keyHash,
            prefix,
            tenantId
        }
    })

    revalidatePath('/admin/settings')
    return { success: true, plainKey }
}

export async function listApiKeysAction() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("Unauthorized")
    }

    const tenantId = session.user.tenantId
    if (!tenantId) return []

    return await db.apiKey.findMany({
        where: { tenantId, revokedAt: null },
        select: {
            id: true,
            name: true,
            prefix: true,
            lastUsed: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function revokeApiKeyAction(id: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("Unauthorized")
    }

    const tenantId = session.user.tenantId
    if (!tenantId) throw new Error("No tenant found")

    await db.apiKey.update({
        where: { id, tenantId },
        data: { revokedAt: new Date() }
    })

    revalidatePath('/admin/settings')
    return { success: true }
}
