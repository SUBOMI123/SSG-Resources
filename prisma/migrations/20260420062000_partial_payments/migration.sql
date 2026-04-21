-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIAL';

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "amount_paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "balance_due" DOUBLE PRECISION;

UPDATE "Order"
SET "amount_paid" = CASE
  WHEN "payment_status" = 'PAID' THEN "total"
  ELSE 0
END,
"balance_due" = CASE
  WHEN "payment_status" = 'PAID' THEN 0
  ELSE "total"
END;

ALTER TABLE "Order"
ALTER COLUMN "balance_due" SET NOT NULL;

-- CreateTable
CREATE TABLE "OrderPayment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "recorded_by" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderPayment"
ADD CONSTRAINT "OrderPayment_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "OrderPayment_order_id_idx" ON "OrderPayment"("order_id");
CREATE INDEX "OrderPayment_received_at_idx" ON "OrderPayment"("received_at");
