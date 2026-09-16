-- AlterTable: Remove default CUID generation from PropertyVideo.id
-- The id will now be client-provided from the upload intent (videoId)
ALTER TABLE "property_videos" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable: Add storageKey column for new storage abstraction pattern
-- Nullable for backward compatibility with existing url-based videos
ALTER TABLE "property_videos" ADD COLUMN "storageKey" TEXT;

-- CreateIndex: Add unique constraint on storageKey to prevent duplicates
-- Partial index only applies to non-null storageKey values
CREATE UNIQUE INDEX "property_videos_storageKey_key" ON "property_videos"("storageKey") WHERE "storageKey" IS NOT NULL;
