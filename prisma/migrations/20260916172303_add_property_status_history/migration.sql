-- CreateEnum: PropertyStatusChangeReason
CREATE TYPE "PropertyStatusChangeReason" AS ENUM ('DEAL_FELL_THROUGH', 'TRANSACTION_COMPLETED', 'RENTAL_ENDED', 'OWNER_DECISION', 'PRICE_CHANGE', 'OTHER');

-- CreateTable: PropertyStatusHistory
CREATE TABLE "property_status_history" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "fromStatus" "PropertyStatus",
    "toStatus" "PropertyStatus" NOT NULL,
    "reason" "PropertyStatusChangeReason" NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_status_history_propertyId_createdAt_idx" ON "property_status_history"("propertyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "property_status_history_createdAt_idx" ON "property_status_history"("createdAt");

-- AddForeignKey
ALTER TABLE "property_status_history" ADD CONSTRAINT "property_status_history_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_status_history" ADD CONSTRAINT "property_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
