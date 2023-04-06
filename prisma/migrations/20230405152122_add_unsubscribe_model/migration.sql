-- CreateTable
CREATE TABLE "Unsubscribe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unsubscribe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Unsubscribe" ADD CONSTRAINT "Unsubscribe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
