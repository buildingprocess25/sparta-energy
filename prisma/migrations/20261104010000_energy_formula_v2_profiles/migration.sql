-- Energy formula v2 (docs/energy_calculator_formula_v2.md).
-- Adds columns only. No row is deleted, and the backfill below keeps every
-- existing result the same: STANDARD types become STATIS with nameplate = base kW,
-- and usage-based types become DINAMIS, which they already were. The last part
-- relabels equipment categories to the 7 in the revision sheet.

-- AlterTable
ALTER TABLE "equipment_types" ADD COLUMN     "operation_type" TEXT NOT NULL DEFAULT 'STATIS';

-- AlterTable
ALTER TABLE "equipment_brands" ADD COLUMN     "nameplate_kw" DECIMAL(65,30),
ADD COLUMN     "running_pct_of_nameplate" DECIMAL(65,30),
ADD COLUMN     "running_time_pct" DECIMAL(65,30),
ADD COLUMN     "standby_pct_of_nameplate" DECIMAL(65,30),
ADD COLUMN     "standby_time_pct" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "audit_items" ADD COLUMN     "calc_method" TEXT,
ADD COLUMN     "cycle_seconds" INTEGER,
ADD COLUMN     "formula_version" INTEGER,
ADD COLUMN     "operation_type" TEXT,
ADD COLUMN     "running_kw" DECIMAL(65,30),
ADD COLUMN     "running_time_pct" DECIMAL(65,30),
ADD COLUMN     "standby_kw" DECIMAL(65,30),
ADD COLUMN     "standby_time_pct" DECIMAL(65,30),
ADD COLUMN     "store_hours" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "custom_equipment_submissions" ADD COLUMN     "calc_method" TEXT NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "cycle_seconds" INTEGER,
ADD COLUMN     "operation_type" TEXT NOT NULL DEFAULT 'STATIS';

-- Backfill
UPDATE "equipment_types" SET "operation_type" = 'DINAMIS'
WHERE "calc_method" IN ('TRANSACTION', 'BATCH');

UPDATE "equipment_brands" SET "nameplate_kw" = "base_kw" WHERE "nameplate_kw" IS NULL;

-- Allowed values
ALTER TABLE "equipment_types"
  ADD CONSTRAINT "equipment_types_operation_type_check" CHECK ("operation_type" IN ('STATIS', 'DINAMIS'));
ALTER TABLE "custom_equipment_submissions"
  ADD CONSTRAINT "custom_equipment_submissions_operation_type_check" CHECK ("operation_type" IN ('STATIS', 'DINAMIS'));

-- Equipment categories become the 7 from the revision sheet (column D).
-- Only the category label changes; kW, brands and audits are untouched.
-- Old values are in the 4 Nov 2026 master backup.
ALTER TABLE "equipment_types" DROP CONSTRAINT "equipment_types_device_category_check";
ALTER TABLE "custom_equipment_submissions" DROP CONSTRAINT "custom_equipment_submissions_device_category_check";

UPDATE "equipment_types" SET "device_category" = CASE
  WHEN "category" = 'BEANSPOT' OR "device_category" = 'Sistem Beanspot' THEN 'Kitchen & Food Processing (Beanspot)'
  WHEN "device_category" = 'Sistem Tata Cahaya'
    AND ("name" ILIKE 'Polesign%' OR "name" ILIKE 'Shop Sign%' OR "name" ILIKE 'Listplank%') THEN 'Signage & Display'
  WHEN "device_category" = 'Sistem Tata Cahaya' THEN 'Lighting'
  WHEN "device_category" = 'Sistem Tata Udara dan Ventilasi' THEN 'VAC'
  WHEN "device_category" = 'Sistem Refrigerasi' THEN 'Refrigeration'
  WHEN "name" IN ('Paket Kasir', 'Mesin ATM') THEN 'POS'
  ELSE 'Other Equipment'
END;

UPDATE "custom_equipment_submissions" SET "device_category" = CASE
  WHEN "device_category" = 'Sistem Beanspot' THEN 'Kitchen & Food Processing (Beanspot)'
  WHEN "device_category" = 'Sistem Tata Cahaya'
    AND ("name" ILIKE 'Polesign%' OR "name" ILIKE 'Shop Sign%' OR "name" ILIKE 'Listplank%') THEN 'Signage & Display'
  WHEN "device_category" = 'Sistem Tata Cahaya' THEN 'Lighting'
  WHEN "device_category" = 'Sistem Tata Udara dan Ventilasi' THEN 'VAC'
  WHEN "device_category" = 'Sistem Refrigerasi' THEN 'Refrigeration'
  ELSE 'Other Equipment'
END;

ALTER TABLE "equipment_types"
  ADD CONSTRAINT "equipment_types_device_category_check" CHECK ("device_category" IN (
    'Refrigeration', 'Lighting', 'VAC', 'POS', 'Signage & Display',
    'Kitchen & Food Processing (Beanspot)', 'Other Equipment'
  ));
ALTER TABLE "custom_equipment_submissions"
  ADD CONSTRAINT "custom_equipment_submissions_device_category_check" CHECK ("device_category" IN (
    'Refrigeration', 'Lighting', 'VAC', 'POS', 'Signage & Display',
    'Kitchen & Food Processing (Beanspot)', 'Other Equipment'
  ));
