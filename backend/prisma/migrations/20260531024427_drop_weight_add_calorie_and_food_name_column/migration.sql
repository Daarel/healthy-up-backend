/*
  Warnings:

  - You are about to drop the column `weight` on the `calorieLog` table. All the data in the column will be lost.
  - Added the required column `calories` to the `calorieLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "calorieLog" DROP COLUMN "weight",
ADD COLUMN     "calories" INTEGER NOT NULL,
ADD COLUMN     "foodName" VARCHAR(255);
