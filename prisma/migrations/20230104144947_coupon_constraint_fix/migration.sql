/*
  Warnings:

  - The primary key for the `CouponUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `discountType` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - The required column `id` was added to the `CouponUser` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `status` on the `DataBundle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountType" NOT NULL;

-- AlterTable
ALTER TABLE "CouponUser" DROP CONSTRAINT "CouponUser_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "CouponUser_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "DataBundle" DROP COLUMN "status",
ADD COLUMN     "status" "BundleStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "status",
ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'USER';
