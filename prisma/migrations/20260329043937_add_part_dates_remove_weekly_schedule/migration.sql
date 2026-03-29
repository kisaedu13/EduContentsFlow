/*
  Warnings:

  - You are about to drop the `weekly_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "weekly_schedules" DROP CONSTRAINT "weekly_schedules_partId_fkey";

-- DropForeignKey
ALTER TABLE "weekly_schedules" DROP CONSTRAINT "weekly_schedules_projectId_fkey";

-- AlterTable
ALTER TABLE "project_parts" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "weekly_schedules";
