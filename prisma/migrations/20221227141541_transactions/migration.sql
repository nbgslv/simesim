/*
  Warnings:

  - The `status` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `productId` on the `Transaction` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[transactionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `discountType` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `DataBundle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `transactionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountType" NOT NULL;

-- AlterTable
ALTER TABLE "DataBundle" DROP COLUMN "status",
ADD COLUMN     "status" "BundleStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "status",
ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "productId",
ADD COLUMN     "transactionId" TEXT NOT NULL,
ALTER COLUMN "refillAmountMb" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionId_key" ON "Transaction"("transactionId");
