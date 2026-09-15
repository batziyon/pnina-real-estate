-- CreateEnum
CREATE TYPE "RepresentationType" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE', 'COOPERATION');

-- CreateEnum
CREATE TYPE "ContactRoleType" AS ENUM ('BUYER', 'SELLER', 'RENTER', 'LANDLORD', 'INVESTOR', 'COLLABORATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementPreferenceType" AS ENUM ('REQUIRED', 'PREFERRED');

-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN     "contactId" TEXT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "houseNumber" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "ownerContactId" TEXT,
ADD COLUMN     "representationType" "RepresentationType" NOT NULL DEFAULT 'NON_EXCLUSIVE',
ADD COLUMN     "street" TEXT;

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "contactId" TEXT;

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "assignedAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_roles" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "role" "ContactRoleType" NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_requirements" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "dealType" "DealType" NOT NULL,
    "propertyType" "PropertyType",
    "minRooms" DECIMAL(4,1),
    "maxRooms" DECIMAL(4,1),
    "minArea" DECIMAL(10,2),
    "maxArea" DECIMAL(10,2),
    "minPrice" DECIMAL(14,2),
    "maxPrice" DECIMAL(14,2),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_requirement_neighborhoods" (
    "id" TEXT NOT NULL,
    "buyerRequirementId" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "preferenceType" "RequirementPreferenceType" NOT NULL DEFAULT 'PREFERRED',

    CONSTRAINT "buyer_requirement_neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_phone_idx" ON "contacts"("phone");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_assignedAgentId_idx" ON "contacts"("assignedAgentId");

-- CreateIndex
CREATE INDEX "contacts_createdAt_idx" ON "contacts"("createdAt");

-- CreateIndex
CREATE INDEX "contact_roles_contactId_idx" ON "contact_roles"("contactId");

-- CreateIndex
CREATE INDEX "contact_roles_role_idx" ON "contact_roles"("role");

-- CreateIndex
CREATE INDEX "contact_roles_active_idx" ON "contact_roles"("active");

-- CreateIndex
CREATE UNIQUE INDEX "contact_roles_contactId_role_key" ON "contact_roles"("contactId", "role");

-- CreateIndex
CREATE INDEX "buyer_requirements_contactId_idx" ON "buyer_requirements"("contactId");

-- CreateIndex
CREATE INDEX "buyer_requirements_dealType_idx" ON "buyer_requirements"("dealType");

-- CreateIndex
CREATE INDEX "buyer_requirements_propertyType_idx" ON "buyer_requirements"("propertyType");

-- CreateIndex
CREATE INDEX "buyer_requirements_active_idx" ON "buyer_requirements"("active");

-- CreateIndex
CREATE INDEX "buyer_requirements_createdAt_idx" ON "buyer_requirements"("createdAt");

-- CreateIndex
CREATE INDEX "buyer_requirement_neighborhoods_buyerRequirementId_idx" ON "buyer_requirement_neighborhoods"("buyerRequirementId");

-- CreateIndex
CREATE INDEX "buyer_requirement_neighborhoods_neighborhoodId_idx" ON "buyer_requirement_neighborhoods"("neighborhoodId");

-- CreateIndex
CREATE INDEX "buyer_requirement_neighborhoods_preferenceType_idx" ON "buyer_requirement_neighborhoods"("preferenceType");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_requirement_neighborhoods_buyerRequirementId_neighbor_key" ON "buyer_requirement_neighborhoods"("buyerRequirementId", "neighborhoodId");

-- CreateIndex
CREATE INDEX "inquiries_contactId_idx" ON "inquiries"("contactId");

-- CreateIndex
CREATE INDEX "properties_ownerContactId_idx" ON "properties"("ownerContactId");

-- CreateIndex
CREATE INDEX "properties_representationType_idx" ON "properties"("representationType");

-- CreateIndex
CREATE INDEX "testimonials_contactId_idx" ON "testimonials"("contactId");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_roles" ADD CONSTRAINT "contact_roles_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_requirements" ADD CONSTRAINT "buyer_requirements_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_requirement_neighborhoods" ADD CONSTRAINT "buyer_requirement_neighborhoods_buyerRequirementId_fkey" FOREIGN KEY ("buyerRequirementId") REFERENCES "buyer_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_requirement_neighborhoods" ADD CONSTRAINT "buyer_requirement_neighborhoods_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "neighborhoods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerContactId_fkey" FOREIGN KEY ("ownerContactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
