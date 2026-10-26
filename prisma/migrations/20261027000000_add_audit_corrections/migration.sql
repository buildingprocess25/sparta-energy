-- Additive only: validation corrections log and the submitted results before
-- correction. Existing columns, the v_toko_sangat_boros view and other repos
-- are unaffected.

-- CreateEnum
CREATE TYPE "AuditCorrectionType" AS ENUM ('ITEM_ADDED', 'ITEM_UPDATED', 'ITEM_DELETED', 'PLN_UPDATED', 'TECHNICAL_UPDATED', 'ADDRESS_UPDATED');

-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "original_avg_actual_pln_kwh_per_month" DECIMAL(65,30),
ADD COLUMN     "original_is_boros" BOOLEAN,
ADD COLUMN     "original_total_estimated_kwh_per_month" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "audit_corrections" (
    "id" UUID NOT NULL,
    "audit_id" UUID NOT NULL,
    "validator_id" UUID,
    "type" "AuditCorrectionType" NOT NULL,
    "summary" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_corrections_audit_id_created_at_idx" ON "audit_corrections"("audit_id", "created_at");

-- AddForeignKey
ALTER TABLE "audit_corrections" ADD CONSTRAINT "audit_corrections_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_corrections" ADD CONSTRAINT "audit_corrections_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
