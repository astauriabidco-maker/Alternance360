import db from '@/lib/db'
import { createHash } from 'crypto'

/**
 * Validates an API key against the database.
 * Returns the associated Tenant if valid, null otherwise.
 */
export async function validateApiKey(key: string) {
    if (!key || !key.startsWith('cfa_live_')) {
        return null
    }

    try {
        const keyHash = createHash('sha256').update(key).digest('hex')

        const apiKey = await db.apiKey.findUnique({
            where: { keyHash },
            include: { tenant: true }
        })

        if (!apiKey || apiKey.revokedAt) {
            return null
        }

        // Update last used timestamp (async, don't block)
        db.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() }
        }).catch((err: any) => console.error("Error updating API key lastUsed:", err))

        return apiKey.tenant
    } catch (error) {
        console.error("API Key Validation Error:", error)
        return null
    }
}

/**
 * Middleware-like wrapper for API Route Handlers.
 * Injects the validated Tenant into the handler.
 */
import { NextResponse } from 'next/server'

export function withApiKey(handler: (req: Request, tenant: any, ...args: any[]) => Promise<Response>) {
    return async (req: Request, ...args: any[]) => {
        const apiKey = req.headers.get('x-api-key')
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API Key (x-api-key header)' }, { status: 401 })
        }

        const tenant = await validateApiKey(apiKey)
        if (!tenant) {
            return NextResponse.json({ error: 'Invalid or revoked API Key' }, { status: 403 })
        }

        return handler(req, tenant, ...args)
    }
}
