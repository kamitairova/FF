/*
  Warnings:

  - You are about to drop the column `origin` on the `Thread` table. All the data in the column will be lost.
  - You are about to drop the column `resumeId` on the `Thread` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seekerProfileId,companyProfileId,vacancyId]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.
  - Made the column `vacancyId` on table `Thread` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CandidateStage" AS ENUM ('UNDER_REVIEW', 'INTERVIEWED', 'INVITED_TO_INTERVIEW', 'HIRED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_vacancyId_fkey";

-- DropIndex
DROP INDEX "Thread_companyProfileId_idx";

-- DropIndex
DROP INDEX "Thread_createdByUserId_idx";

-- DropIndex
DROP INDEX "Thread_origin_idx";

-- DropIndex
DROP INDEX "Thread_resumeId_idx";

-- DropIndex
DROP INDEX "Thread_seekerProfileId_companyProfileId_key";

-- DropIndex
DROP INDEX "Thread_seekerProfileId_idx";

-- DropIndex
DROP INDEX "Thread_vacancyId_idx";

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "origin",
DROP COLUMN "resumeId",
ADD COLUMN     "candidateStage" "CandidateStage",
ADD COLUMN     "companyEngagedAt" TIMESTAMP(3),
ALTER COLUMN "vacancyId" SET NOT NULL;

-- CreateTable
CREATE TABLE "ThreadParticipantHidden" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "hiddenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadParticipantHidden_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreadParticipantHidden_threadId_userId_key" ON "ThreadParticipantHidden"("threadId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Thread_seekerProfileId_companyProfileId_vacancyId_key" ON "Thread"("seekerProfileId", "companyProfileId", "vacancyId");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipantHidden" ADD CONSTRAINT "ThreadParticipantHidden_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipantHidden" ADD CONSTRAINT "ThreadParticipantHidden_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
