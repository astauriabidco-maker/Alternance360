import { NextRequest, NextResponse } from 'next/server'
import { withApiKey } from '@/lib/api-auth'
import db from '@/lib/db'
import { uploadFile } from '@/lib/upload'

/**
 * Endpoint for Mobile App to submit proofs (images/PDFs) directly.
 * Auth: x-api-key
 */
async function handler(req: Request, tenant: any) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const apprenticeEmail = formData.get('apprenticeEmail') as string
        const competenceId = formData.get('competenceId') as string
        const comment = formData.get('comment') as string

        if (!file || !apprenticeEmail || !competenceId) {
            return NextResponse.json({ error: 'Missing required fields (file, apprenticeEmail, competenceId)' }, { status: 400 })
        }

        // 1. Verify apprentice belongs to this tenant
        const user = await db.user.findFirst({
            where: {
                email: apprenticeEmail,
                tenantId: tenant.id,
                role: 'apprentice'
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'Apprentice not found for this tenant' }, { status: 404 })
        }

        // 2. Upload file
        let fileUrl = ""
        try {
            fileUrl = await uploadFile(file, user.id)
        } catch (e) {
            console.error("Mobile API Upload Error:", e)
            return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
        }

        // 3. Create Proof record
        const proof = await db.proof.create({
            data: {
                userId: user.id,
                competenceId: competenceId,
                title: file.name,
                url: fileUrl,
                type: file.type.startsWith('image/') ? 'IMG' : 'PDF',
                description: comment,
                status: 'PENDING'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Proof submitted successfully',
            data: {
                proofId: proof.id,
                url: fileUrl
            }
        })

    } catch (error: any) {
        console.error("Mobile Proof API Error:", error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export const POST = withApiKey(handler)
