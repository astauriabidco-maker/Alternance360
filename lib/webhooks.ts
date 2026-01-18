import crypto from 'crypto'

export interface WebhookPayload {
    event: 'LIVRET_SIGNED' | 'APPRENTICE_SYNCED'
    timestamp: string
    tenantId: string
    data: any
}

/**
 * Dispatch a webhook with HMAC signature and retry logic.
 */
export async function dispatchWebhook(tenant: { id: string, webhookUrl?: string | null, webhookSecret?: string | null }, event: WebhookPayload['event'], data: any) {
    if (!tenant.webhookUrl) return { skipped: true, reason: 'No webhook URL configured' }

    const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        tenantId: tenant.id,
        data
    }

    const body = JSON.stringify(payload)
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CFA-Event': event,
    }

    // Sign payload if secret exists
    if (tenant.webhookSecret) {
        const signature = crypto
            .createHmac('sha256', tenant.webhookSecret)
            .update(body)
            .digest('hex')
        headers['X-CFA-Signature'] = signature
    }

    // Retry logic
    const MAX_RETRIES = 3
    let attempt = 0
    let lastError: any = null

    while (attempt <= MAX_RETRIES) {
        try {
            const response = await fetch(tenant.webhookUrl, {
                method: 'POST',
                headers,
                body
            })

            if (response.ok) {
                return { success: true, attempt: attempt + 1 }
            }

            throw new Error(`Target returned ${response.status} ${response.statusText}`)
        } catch (error) {
            attempt++
            lastError = error
            if (attempt <= MAX_RETRIES) {
                // Wait before retry (1s, 2s, 4s)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
            }
        }
    }

    console.error(`Webhook delivery failed after ${MAX_RETRIES} retries:`, lastError)
    return { success: false, error: lastError?.message, attempts: attempt }
}
