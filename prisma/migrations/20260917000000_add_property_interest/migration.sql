-- CreateEnum
CREATE TYPE "PropertyInterestStatus" AS ENUM ('INTERESTED', 'WAITING', 'CONTACTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "PropertyInterestSource" AS ENUM ('INQUIRY', 'AGENT_ADDED', 'REQUIREMENT_MATCH', 'WEBSITE');

-- CreateTable
CREATE TABLE "property_interests" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "PropertyInterestStatus" NOT NULL DEFAULT 'INTERESTED',
    "source" "PropertyInterestSource" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_interests_contactId_idx" ON "property_interests"("contactId");

-- CreateIndex
CREATE INDEX "property_interests_propertyId_idx" ON "property_interests"("propertyId");

-- CreateIndex
CREATE INDEX "property_interests_propertyId_status_idx" ON "property_interests"("propertyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "property_interests_contactId_propertyId_key" ON "property_interests"("contactId", "propertyId");

-- AddForeignKey
ALTER TABLE "property_interests" ADD CONSTRAINT "property_interests_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_interests" ADD CONSTRAINT "property_interests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
