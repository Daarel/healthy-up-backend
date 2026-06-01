/*
  Warnings:

  - Added the required column `factualBMI` to the `HealthProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gender` on the `HealthProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "HealthProfile" ADD COLUMN     "factualBMI" DECIMAL(5,2) NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- DropEnum
DROP TYPE "GenderType";
