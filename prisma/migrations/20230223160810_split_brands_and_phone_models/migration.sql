-- AlterTable
ALTER TABLE "SupportedPhones" DROP COLUMN "brand",
ADD COLUMN     "brandId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PhoneBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exceptions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneBrand_name_key" ON "PhoneBrand"("name");

-- AddForeignKey
ALTER TABLE "SupportedPhones" ADD CONSTRAINT "SupportedPhones_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "PhoneBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
