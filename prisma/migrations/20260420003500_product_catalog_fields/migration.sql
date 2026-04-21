-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "slug" TEXT;

-- Backfill slug values for existing rows
UPDATE "Product"
SET "slug" = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

ALTER TABLE "Product"
ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
