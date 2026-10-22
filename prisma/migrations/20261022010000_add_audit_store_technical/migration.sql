-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "store_type" TEXT,
ADD COLUMN     "pln_power_va" INTEGER,
ADD COLUMN     "parking_area_m2" DECIMAL(65,30),
ADD COLUMN     "terrace_area_m2" DECIMAL(65,30),
ADD COLUMN     "sales_area_m2" DECIMAL(65,30),
ADD COLUMN     "warehouse_area_m2" DECIMAL(65,30),
ADD COLUMN     "is_24_hours" BOOLEAN,
ADD COLUMN     "open_time" TEXT,
ADD COLUMN     "close_time" TEXT;

-- Backfill from the store row; only exact for each store's latest audit
UPDATE "audits" a
SET "store_type" = NULLIF(s."type", ''),
    "pln_power_va" = s."pln_power_va",
    "parking_area_m2" = s."parking_area_m2",
    "terrace_area_m2" = s."terrace_area_m2",
    "sales_area_m2" = s."sales_area_m2",
    "warehouse_area_m2" = s."warehouse_area_m2",
    "is_24_hours" = s."is_24_hours",
    "open_time" = s."open_time",
    "close_time" = s."close_time"
FROM "stores" s
WHERE a."store_id" = s."id";
