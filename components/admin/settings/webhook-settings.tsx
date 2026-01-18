'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Webhook, ShieldCheck, RefreshCw, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getTenantSettings, updateTenantSettings } from '@/app/actions/tenant'

export function WebhookSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [webhookUrl, setWebhookUrl] = useState('')
    const [webhookSecret, setWebhookSecret] = useState('')

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        try {
            const data = await getTenantSettings()
            if (data) {
                // @ts-ignore
                setWebhookUrl(data.webhookUrl || '')
                // @ts-ignore
                setWebhookSecret(data.webhookSecret || '')
            }
        } catch (error) {
            toast.error("Échec du chargement des paramètres")
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            await updateTenantSettings({
                // @ts-ignore
                webhookUrl,
                webhookSecret
            })
            toast.success("Paramètres de webhook enregistrés")
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setSaving(false)
        }
    }

    function generateSecret() {
        const secret = Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        setWebhookSecret(secret)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-indigo-600" />
                    <CardTitle>Configuration des Webhooks</CardTitle>
                </div>
                <CardDescription>
                    Recevez des notifications en temps réel vers votre CRM lors de la signature des livrets.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL de destination (POST)</Label>
                    <Input
                        id="webhook-url"
                        placeholder="https://votre-crm.com/api/webhooks/alternance"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Nous enverrons un JSON contenant l'ID externe de l'apprenti et l'URL du PDF.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Secret de signature (HMAC-SHA256)</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="webhook-secret"
                                className="pl-9"
                                type="password"
                                placeholder="secret_partage_pour_verification"
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={generateSecret} title="Générer un secret">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Utilisez ce secret pour vérifier l'authenticité des requêtes (en-tête X-CFA-Signature).
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Enregistrer la configuration
                    </Button>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Badge variant="outline">Doc</Badge> Format du Payload
                    </h4>
                    <pre className="text-[10px] overflow-x-auto p-2 bg-background border rounded">
                        {`{
  "event": "LIVRET_SIGNED",
  "timestamp": "2026-01-18T...",
  "tenantId": "uuid",
  "data": {
    "apprenticeExternalId": "CRM-123",
    "downloadUrl": "...",
    "progressScore": 85
  }
}`}
                    </pre>
                </div>
            </CardContent>
        </Card>
    )
}
