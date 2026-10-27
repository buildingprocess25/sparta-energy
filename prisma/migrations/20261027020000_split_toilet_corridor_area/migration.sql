-- Additive only: toilet and selasar (corridor) area get their own columns.
-- warehouse_area_m2 now means gudang only. Existing rows keep the combined
-- value there with the new columns at 0, so total area is unchanged.

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "toilet_area_m2" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "corridor_area_m2" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "audits" ADD COLUMN     "toilet_area_m2" DECIMAL(65,30),
ADD COLUMN     "corridor_area_m2" DECIMAL(65,30);

-- Audits that already hold their own area snapshot get 0, not the store value
UPDATE "audits"
SET "toilet_area_m2" = 0,
    "corridor_area_m2" = 0
WHERE "warehouse_area_m2" IS NOT NULL;
