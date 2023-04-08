-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "countryId" TEXT;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
