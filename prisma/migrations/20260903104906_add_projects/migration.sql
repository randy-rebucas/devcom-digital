-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
