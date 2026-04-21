-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEB', 'MANUAL');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "assigned_to" TEXT,
ADD COLUMN "source" "OrderSource" NOT NULL DEFAULT 'WEB';
