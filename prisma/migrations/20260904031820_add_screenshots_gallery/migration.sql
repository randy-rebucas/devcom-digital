-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[];
