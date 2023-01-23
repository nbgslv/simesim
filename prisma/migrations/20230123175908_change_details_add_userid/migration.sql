-- DropIndex
DROP INDEX "ChangeDetails_emailEmail_key";

-- AlterTable
ALTER TABLE "ChangeDetails" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "emailEmail" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChangeDetails" ADD CONSTRAINT "ChangeDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
