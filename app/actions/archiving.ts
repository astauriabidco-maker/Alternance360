'use server'

import db from '@/lib/db'
import { auth } from '@/auth'

// Mock Storage Function
async function uploadToGlacier(contractId: string, content: string): Promise<string> {
    // In real life: Upload to S3/Glacier
    return `https://glacier-storage.aws.com/archives/${contractId}.pdf`
}

export async function executeAnnualArchiving(tenantId: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // 1. Identification: Terminated contracts > 6 months ago
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const contracts = await db.contract.findMany({
        where: {
            tenantId: tenantId,
            endDate: { lt: sixMonthsAgo },
            // Ensure not already archived to avoid dupes if run multiple times
            // We can check if it exists in ArchiveVault via extra query or assumption
        },
        include: {
            user: true,
            tsfEvaluations: true,
            // Add other relations to archive
        }
    })

    const results = {
        processed: 0,
        archived: 0,
        errors: 0
    }

    // 2. Archive Loop
    for (const contract of contracts) {
        try {
            await db.$transaction(async (tx) => {
                // A. Snapshot Data
                const fullHistory = {
                    contract: contract,
                    evaluations: contract.tsfEvaluations,
                    archivedBy: session.user?.id,
                    archivedAt: new Date()
                }

                // B. Upload "Master" (Mocked)
                // In production, we would verify 'finalReportUrl' exists or generate it here.
                const pdfUrl = await uploadToGlacier(contract.id, JSON.stringify(fullHistory))

                // C. Create Vault Entry
                const purgeDate = new Date()
                purgeDate.setFullYear(purgeDate.getFullYear() + 5) // +5 Years

                await tx.archiveVault.create({
                    data: {
                        apprenticeName: `${contract.user?.firstName} ${contract.user?.lastName}`,
                        contractRef: contract.id,
                        tenantId: contract.tenantId,
                        finalPdfUrl: pdfUrl,
                        fullHistoryJson: JSON.stringify(fullHistory),
                        purgeDate: purgeDate
                    }
                })

                // D. Purge Operational Data
                // Cascade delete should handle evaluations if configured, but let's be explicit if needed.
                // Our schema says: Contract includes: tsfEvaluations EvaluationIndicateur[]
                // Schema: contract     Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
                // So deleting Contract deletes Evaluations too.

                await tx.contract.delete({
                    where: { id: contract.id }
                })

                // Also create Audit Log
                await tx.auditLog.create({
                    data: {
                        action: "ARCHIVE_CONTRACT",
                        entityType: "Contract",
                        entityId: contract.id,
                        actorId: session.user?.id || 'system',
                        details: JSON.stringify({ vaultId: "generated-uuid", reason: "Annual Policy" })
                    }
                })
            })

            results.archived++
        } catch (e) {
            console.error(`Failed to archive contract ${contract.id}`, e)
            results.errors++
        }
        results.processed++
    }

    return results
}

export async function getArchivingCandidates(tenantId: string) {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return await db.contract.count({
        where: {
            tenantId: tenantId,
            endDate: { lt: sixMonthsAgo }
        }
    })
}
