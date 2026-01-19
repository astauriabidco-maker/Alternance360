-- CreateTable
CREATE TABLE "RemediationPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "triggerReason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "actions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "contractId" TEXT NOT NULL,
    "createdById" TEXT,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "RemediationPlan_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RemediationPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
