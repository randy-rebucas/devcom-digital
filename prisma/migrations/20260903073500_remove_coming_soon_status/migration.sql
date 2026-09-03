-- Drop COMING_SOON from ToolStatus enum (Postgres requires recreating the type)
ALTER TYPE "ToolStatus" RENAME TO "ToolStatus_old";
CREATE TYPE "ToolStatus" AS ENUM ('IN_DEVELOPMENT', 'AVAILABLE');
ALTER TABLE "Tool" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tool" ALTER COLUMN "status" TYPE "ToolStatus" USING ("status"::text::"ToolStatus");
ALTER TABLE "Tool" ALTER COLUMN "status" SET DEFAULT 'IN_DEVELOPMENT';
DROP TYPE "ToolStatus_old";
