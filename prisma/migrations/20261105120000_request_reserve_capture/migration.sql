-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "capturedAmount" INTEGER,
ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "captureDeadline" TIMESTAMP(3),
ADD COLUMN     "reservedAmount" INTEGER,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "vippsReference" TEXT;
