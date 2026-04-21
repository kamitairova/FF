-- DropIndex
DROP INDEX "JobSeekerProfile_experienceLevel_idx";

-- DropIndex
DROP INDEX "JobSeekerProfile_firstName_idx";

-- DropIndex
DROP INDEX "JobSeekerProfile_lastName_idx";

-- DropIndex
DROP INDEX "JobSeekerProfile_location_idx";

-- AlterTable
ALTER TABLE "JobSeekerProfile" ADD COLUMN     "avatarUrl" TEXT;
