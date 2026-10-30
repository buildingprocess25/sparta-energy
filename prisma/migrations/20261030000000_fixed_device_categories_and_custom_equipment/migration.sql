-- Device categories become a fixed list of five (lib/equipment-categories.ts),
-- and store-added custom equipment gets its own review table. Only equipment
-- tables change; stores, users, the v_toko_sangat_boros view and other repos
-- are unaffected.

-- Map existing categories onto the fixed list.
UPDATE "equipment_types"
SET "device_category" = CASE
  WHEN "category" = 'BEANSPOT' THEN 'Sistem Beanspot'
  WHEN "device_category" IN ('Pencahayaan', 'Sistem Tata Cahaya') THEN 'Sistem Tata Cahaya'
  WHEN "device_category" IN ('Sistem Tata Udara dan Ventilasi', 'Sistem HVAC')
    OR "name" ILIKE 'Exhaust Fan%' THEN 'Sistem Tata Udara dan Ventilasi'
  WHEN "device_category" = 'Sistem Pendingin Produk' THEN 'Sistem Refrigerasi'
  ELSE 'Lainnya'
END;

ALTER TABLE "equipment_types"
  ADD CONSTRAINT "equipment_types_device_category_check" CHECK ("device_category" IN (
    'Sistem Tata Cahaya', 'Sistem Tata Udara dan Ventilasi', 'Sistem Refrigerasi', 'Sistem Beanspot', 'Lainnya'
  ));

-- CreateEnum
CREATE TYPE "CustomEquipmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "audit_items" ADD COLUMN     "custom_equipment_id" UUID;

-- CreateTable
CREATE TABLE "custom_equipment_submissions" (
    "id" UUID NOT NULL,
    "audit_id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "submitted_by_id" UUID,
    "name" TEXT NOT NULL,
    "device_category" TEXT NOT NULL,
    "area_target" "AreaTarget" NOT NULL,
    "base_kw" DECIMAL(65,30) NOT NULL,
    "brand_name" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "product_photo_url" TEXT NOT NULL,
    "status" "CustomEquipmentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "equipment_type_id" UUID,
    "equipment_brand_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_equipment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_equipment_submissions_status_created_at_idx" ON "custom_equipment_submissions"("status", "created_at");

-- CreateIndex
CREATE INDEX "custom_equipment_submissions_audit_id_idx" ON "custom_equipment_submissions"("audit_id");

-- AddForeignKey
ALTER TABLE "audit_items" ADD CONSTRAINT "audit_items_custom_equipment_id_fkey" FOREIGN KEY ("custom_equipment_id") REFERENCES "custom_equipment_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_equipment_submissions" ADD CONSTRAINT "custom_equipment_submissions_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_equipment_submissions" ADD CONSTRAINT "custom_equipment_submissions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_equipment_submissions" ADD CONSTRAINT "custom_equipment_submissions_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_equipment_submissions" ADD CONSTRAINT "custom_equipment_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_equipment_submissions" ADD CONSTRAINT "custom_equipment_submissions_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_equipment_submissions" ADD CONSTRAINT "custom_equipment_submissions_equipment_brand_id_fkey" FOREIGN KEY ("equipment_brand_id") REFERENCES "equipment_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "custom_equipment_submissions"
  ADD CONSTRAINT "custom_equipment_submissions_device_category_check" CHECK ("device_category" IN (
    'Sistem Tata Cahaya', 'Sistem Tata Udara dan Ventilasi', 'Sistem Refrigerasi', 'Sistem Beanspot', 'Lainnya'
  ));
