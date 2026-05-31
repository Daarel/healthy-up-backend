/*
  Warnings:

  - Added the required column `category` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "category" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "UserReward" ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usedAt" TIMESTAMPTZ;
