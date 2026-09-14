-- AlterTable: add Inner Circle membership fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isInnerCircle" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "innerCircleJoinedAt" TIMESTAMP(3);
