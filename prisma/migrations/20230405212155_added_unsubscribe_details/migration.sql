-- CreateEnum
CREATE TYPE "UnsubscribeType" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "MessagesType" AS ENUM ('COMMERCIAL', 'NOTIFICATION');

-- AlterTable
ALTER TABLE "Unsubscribe" ADD COLUMN     "messageType" "MessagesType"[],
ADD COLUMN     "type" "UnsubscribeType"[];
