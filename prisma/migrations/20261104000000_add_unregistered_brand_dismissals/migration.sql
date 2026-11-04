-- New, empty table for "Abaikan" in Merek dari lapangan. No existing table or row changes.
-- CreateTable
CREATE TABLE "unregistered_brand_dismissals" (
    "id" UUID NOT NULL,
    "equipment_type_id" UUID NOT NULL,
    "brand_name" TEXT NOT NULL,
    "dismissed_by_id" UUID,
    "dismissed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unregistered_brand_dismissals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unregistered_brand_dismissals_equipment_type_id_brand_name_key" ON "unregistered_brand_dismissals"("equipment_type_id", "brand_name");

-- AddForeignKey
ALTER TABLE "unregistered_brand_dismissals" ADD CONSTRAINT "unregistered_brand_dismissals_equipment_type_id_fkey" FOREIGN KEY ("equipment_type_id") REFERENCES "equipment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
