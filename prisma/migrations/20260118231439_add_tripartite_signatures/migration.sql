-- AlterTable
ALTER TABLE "Livret" ADD COLUMN "apprenticeSignatureData" TEXT;
ALTER TABLE "Livret" ADD COLUMN "apprenticeSignedAt" DATETIME;
ALTER TABLE "Livret" ADD COLUMN "cfaSignatureData" TEXT;
ALTER TABLE "Livret" ADD COLUMN "cfaSignedAt" DATETIME;
ALTER TABLE "Livret" ADD COLUMN "tutorSignatureData" TEXT;
ALTER TABLE "Livret" ADD COLUMN "tutorSignedAt" DATETIME;
