-- CreateEnum
CREATE TYPE "EnergyAuditCategory" AS ENUM ('TATA_CAHAYA', 'TATA_UDARA_VENTILASI', 'REFRIGERASI', 'SELUBUNG_BANGUNAN', 'KELISTRIKAN', 'BEBAN_PASIF_STOPKONTAK', 'BEANSPOT');

-- CreateEnum
CREATE TYPE "EnergyAuditStatus" AS ENUM ('DRAFT', 'COMPLETED');

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "address" TEXT;

-- CreateTable
CREATE TABLE "energy_audits" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "source_audit_id" UUID,
    "category" "EnergyAuditCategory" NOT NULL,
    "status" "EnergyAuditStatus" NOT NULL DEFAULT 'DRAFT',
    "auditor_id" UUID NOT NULL,
    "audit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary_status" TEXT,
    "data" JSONB NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "energy_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "energy_audits_category_status_idx" ON "energy_audits"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "energy_audits_source_audit_id_category_key" ON "energy_audits"("source_audit_id", "category");

-- AddForeignKey
ALTER TABLE "energy_audits" ADD CONSTRAINT "energy_audits_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audits" ADD CONSTRAINT "energy_audits_source_audit_id_fkey" FOREIGN KEY ("source_audit_id") REFERENCES "audits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "energy_audits" ADD CONSTRAINT "energy_audits_auditor_id_fkey" FOREIGN KEY ("auditor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
