-- DropForeignKey
ALTER TABLE "inquiries" DROP CONSTRAINT "inquiries_propertyId_fkey";

-- AlterTable
ALTER TABLE "inquiries" ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
