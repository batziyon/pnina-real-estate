-- AlterEnum: Rename RESERVED to UNDER_CONTRACT in PropertyStatus enum
-- This is safe in PostgreSQL - existing RESERVED values automatically become UNDER_CONTRACT
ALTER TYPE "PropertyStatus" RENAME VALUE 'RESERVED' TO 'UNDER_CONTRACT';
