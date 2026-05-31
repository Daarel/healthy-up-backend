/*
  Warnings:

  - The `badges` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Badge" AS ENUM ('LEVEL_10', 'LEVEL_20', 'LEVEL_30');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "badges",
ADD COLUMN     "badges" "Badge"[] DEFAULT ARRAY[]::"Badge"[];
