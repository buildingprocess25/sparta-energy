-- CreateEnum
CREATE TYPE "AuditValidationStatus" AS ENUM ('PENDING', 'VALIDATED');

-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "gap_percent" DECIMAL(65,30),
ADD COLUMN     "validation_status" "AuditValidationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "validated_at" TIMESTAMP(3),
ADD COLUMN     "validated_by_id" UUID;

-- CreateIndex
CREATE INDEX "audits_validation_status_gap_percent_idx" ON "audits"("validation_status", "gap_percent");

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_validated_by_id_fkey" FOREIGN KEY ("validated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill gap for audits saved before this column existed
UPDATE "audits"
SET "gap_percent" = ("avg_actual_pln_kwh_per_month" - "total_estimated_kwh_per_month") / "total_estimated_kwh_per_month" * 100
WHERE "total_estimated_kwh_per_month" > 0
  AND "avg_actual_pln_kwh_per_month" IS NOT NULL;
