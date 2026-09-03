-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('COMING_SOON', 'IN_DEVELOPMENT', 'AVAILABLE');

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "status" "ToolStatus" NOT NULL DEFAULT 'COMING_SOON',
    "guideUrl" TEXT,
    "downloadUrl" TEXT,
    "requiresLicenseKey" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
