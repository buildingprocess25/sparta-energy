-- Additive only: three new roles and the GS device access table
-- (docs/akses-role-admin-auditor-gs-area.md, bagian 4). Existing users keep
-- their role; nothing is updated or deleted.

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'AUDITOR';
ALTER TYPE "Role" ADD VALUE 'GS';
ALTER TYPE "Role" ADD VALUE 'AREA';

-- CreateTable
CREATE TABLE "user_device_access" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_device_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_device_access_user_id_device_id_key" ON "user_device_access"("user_id", "device_id");

-- AddForeignKey
ALTER TABLE "user_device_access" ADD CONSTRAINT "user_device_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_device_access" ADD CONSTRAINT "user_device_access_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
