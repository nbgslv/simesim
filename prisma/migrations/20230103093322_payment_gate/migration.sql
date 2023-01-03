/*
  Warnings:

  - You are about to drop the column `planModelId` on the `Coupon` table. All the data in the column will be lost.
  - The `status` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[transactionId]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `discountType` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `DataBundle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `paymentType` to the `PaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CREDIT_CARD', 'BIT', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY');

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_planModelId_fkey";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "planModelId",
DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountType" NOT NULL;

-- AlterTable
ALTER TABLE "DataBundle" DROP COLUMN "status",
ADD COLUMN     "status" "BundleStatus" NOT NULL;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "paymentType" "PaymentType" NOT NULL,
ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "status",
ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "_CouponToPlanModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CouponToPlanModel_AB_unique" ON "_CouponToPlanModel"("A", "B");

-- CreateIndex
CREATE INDEX "_CouponToPlanModel_B_index" ON "_CouponToPlanModel"("B");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_transactionId_key" ON "PaymentMethod"("transactionId");

-- AddForeignKey
ALTER TABLE "_CouponToPlanModel" ADD CONSTRAINT "_CouponToPlanModel_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToPlanModel" ADD CONSTRAINT "_CouponToPlanModel_B_fkey" FOREIGN KEY ("B") REFERENCES "PlanModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
