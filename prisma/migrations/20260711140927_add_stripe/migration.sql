/*
  Warnings:

  - The values [COD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('STRIPE');
ALTER TABLE "public"."payments" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "payments" ALTER COLUMN "method" SET DEFAULT 'STRIPE';
COMMIT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "stripeClientSecret" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ALTER COLUMN "method" SET DEFAULT 'STRIPE';
