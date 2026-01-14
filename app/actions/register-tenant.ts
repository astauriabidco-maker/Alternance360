'use server'

import { z } from 'zod'
import db from '@/lib/db'
import { hash } from 'bcryptjs'
import { redirect } from 'next/navigation'

const RegisterSchema = z.object({
    cfaName: z.string().min(2, "Le nom du CFA doit contenir au moins 2 caractères"),
    adminEmail: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
})

export async function registerTenant(formData: FormData) {
    const rawData = {
        cfaName: formData.get('cfaName'),
        adminEmail: formData.get('adminEmail'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
    }

    const validated = RegisterSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: "Données invalides", details: validated.error.flatten() }
    }

    const { cfaName, adminEmail, password, firstName, lastName } = validated.data

    try {
        // 1. Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email: adminEmail }
        })

        if (existingUser) {
            return { error: "Cet email est déjà utilisé." }
        }

        // 2. Create Tenant
        const tenant = await db.tenant.create({
            data: {
                name: cfaName
            }
        })

        // 3. Hash Password
        const hashedPassword = await hash(password, 10)

        // 4. Create Admin User linked to Tenant
        await db.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                firstName,
                lastName,
                fullName: `${firstName} ${lastName}`,
                role: 'admin', // First user is Admin
                tenantId: tenant.id
            }
        })

        return { success: true }

    } catch (error) {
        console.error("Registration Error:", error)
        return { error: "Une erreur est survenue lors de l'inscription." }
    }
}
