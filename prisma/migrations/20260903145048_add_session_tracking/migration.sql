-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentSessionId" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginIp" TEXT;
