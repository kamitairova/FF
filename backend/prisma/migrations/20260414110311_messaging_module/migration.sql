/*
  Warnings:

  - Added the required column `createdByUserId` to the `Thread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ThreadOrigin" AS ENUM ('APPLICATION', 'INVITATION', 'DIRECT');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "createdByUserId" INTEGER NOT NULL,
ADD COLUMN     "origin" "ThreadOrigin" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "resumeId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vacancyId" INTEGER;

-- CreateIndex
CREATE INDEX "Thread_createdByUserId_idx" ON "Thread"("createdByUserId");

-- CreateIndex
CREATE INDEX "Thread_origin_idx" ON "Thread"("origin");

-- CreateIndex
CREATE INDEX "Thread_vacancyId_idx" ON "Thread"("vacancyId");

-- CreateIndex
CREATE INDEX "Thread_resumeId_idx" ON "Thread"("resumeId");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
