-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "paid_at" TIMESTAMP(3),
ADD COLUMN "payment_url" TEXT,
ADD COLUMN "paystack_access_code" TEXT,
ADD COLUMN "paystack_reference" TEXT;
