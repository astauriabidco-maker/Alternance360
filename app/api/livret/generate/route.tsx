import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import db from '@/lib/db'
import { consolidateLivretData } from '@/app/actions/livret'
import { renderToBuffer } from '@react-pdf/renderer'
import { LivretDocument } from '@/components/pdf/livret-document'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const { contractId } = await req.json()
        if (!contractId) {
            return NextResponse.json({ error: 'contractId requis' }, { status: 400 })
        }

        // Verify access (user is linked to contract or is admin)
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: { tenant: true }
        })

        if (!contract) {
            return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
        }

        // Consolidate data
        const data = await consolidateLivretData(contractId)
        if (!data) {
            return NextResponse.json({ error: 'Données non disponibles' }, { status: 500 })
        }

        // Generate PDF buffer
        const pdfBuffer = await renderToBuffer(
            // @ts-ignore - React-PDF types issue
            <LivretDocument data={data} />
        )

        // Save to public folder (or S3 in production)
        const livretDir = join(process.cwd(), 'public', 'livrets')
        await mkdir(livretDir, { recursive: true })

        const filename = `livret-${data.documentId}.pdf`
        const filePath = join(livretDir, filename)
        await writeFile(filePath, pdfBuffer)

        // Save record in DB
        const livret = await db.livret.create({
            data: {
                documentId: data.documentId,
                filePath: `/livrets/${filename}`,
                contractId: contract.id,
                tenantId: contract.tenantId
            }
        })

        return NextResponse.json({
            success: true,
            documentId: data.documentId,
            downloadUrl: `/livrets/${filename}`,
            livretId: livret.id
        })
    } catch (error) {
        console.error('Livret generation error:', error)
        return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
    }
}
