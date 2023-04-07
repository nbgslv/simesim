-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- AlterEnum
ALTER TYPE "MessageSubject" ADD VALUE 'INCOMING';

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_userId_fkey";

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "body" TEXT,
ADD COLUMN     "direction" "MessageDirection" DEFAULT 'INBOUND',
ADD COLUMN     "from" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
