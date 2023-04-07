-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Messages_token_key" ON "Messages"("token");
