-- CreateEnum
CREATE TYPE "ToolCategory" AS ENUM ('SHOPIFY_THEMES', 'SHOPIFY_APPS', 'MARKETING', 'OTHER');

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "category" "ToolCategory" NOT NULL DEFAULT 'OTHER';
