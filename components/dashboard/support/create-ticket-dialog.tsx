"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { createTicket } from "@/app/actions/tickets"
import { Plus, Loader2 } from "lucide-react"

export function CreateTicketDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await createTicket(null, formData)
            if (result.success) {
                toast.success("Ticket créé avec succès")
                setOpen(false)
            } else {
                toast.error(result.error || "Erreur lors de la création")
            }
        } catch (error) {
            toast.error("Erreur serveur")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-2xl bg-slate-900 font-bold hover:bg-indigo-600 transition-colors gap-2">
                    <Plus size={18} /> Nouveau Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-0 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900">Nouveau Ticket</DialogTitle>
                    <DialogDescription>
                        Décrivez votre problème. Notre équipe vous répondra rapidement.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Sujet</Label>
                        <Input name="subject" required placeholder="Ex: Problème d'import RNCP" className="rounded-xl bg-slate-50 border-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select name="category" required defaultValue="GENERAL">
                                <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="GENERAL">Général</SelectItem>
                                    <SelectItem value="TECH">Technique</SelectItem>
                                    <SelectItem value="BILLING">Facturation</SelectItem>
                                    <SelectItem value="PEDAGOGY">Pédagogie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priorité</Label>
                            <Select name="priority" required defaultValue="MEDIUM">
                                <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="LOW">Basse</SelectItem>
                                    <SelectItem value="MEDIUM">Moyenne</SelectItem>
                                    <SelectItem value="HIGH">Haute</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            name="message"
                            required
                            placeholder="Détaillez votre demande..."
                            className="min-h-[150px] rounded-xl bg-slate-50 border-slate-200 resize-none"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                            Envoyer la demande
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
