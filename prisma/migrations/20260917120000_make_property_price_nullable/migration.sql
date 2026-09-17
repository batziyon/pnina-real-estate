-- AlterTable: Make Property.price nullable
-- Business requirement: Price may not be known at property creation time
ALTER TABLE "properties" ALTER COLUMN "price" DROP NOT NULL;
