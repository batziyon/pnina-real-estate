-- AlterTable: Remove default CUID generation from PropertyImage.id
-- The id will now be client-provided from the upload intent (imageId)
ALTER TABLE "property_images" ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex: Add unique constraint on storageKey to prevent duplicates
-- Nullable for backward compatibility with existing rows
CREATE UNIQUE INDEX "property_images_storageKey_key" ON "property_images"("storageKey") WHERE "storageKey" IS NOT NULL;

-- CreateIndex: Add partial unique index to enforce one main image per property
-- This prevents multiple images with isMain=true for the same property
CREATE UNIQUE INDEX "property_images_one_main_per_property" ON "property_images"("propertyId") WHERE "isMain" = true;
