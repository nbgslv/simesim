-- CreateTable
CREATE TABLE "SupportedPhones" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "phoneModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportedPhones_pkey" PRIMARY KEY ("id")
);
