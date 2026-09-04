-- CreateTable
CREATE TABLE "ToolApiKey" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "name" TEXT,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ToolApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToolApiKey_keyHash_key" ON "ToolApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ToolApiKey_toolId_idx" ON "ToolApiKey"("toolId");

-- AddForeignKey
ALTER TABLE "ToolApiKey" ADD CONSTRAINT "ToolApiKey_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
