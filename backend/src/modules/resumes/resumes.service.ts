import { prisma } from "../../prisma";
import {
  removeStoredFileIfExists,
  toPublicUploadUrl,
  toRelativeStoragePath,
} from "../uploads/upload.config";
import { CreateResumeInput, UpdateResumeInput } from "./resumes.schemas";

const ownResumeSelect = {
  id: true,
  seekerProfileId: true,
  title: true,
  desiredPosition: true,
  salaryExpectation: true,
  experienceLevel: true,
  skills: true,
  isPublic: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  resumeFile: {
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
      sizeBytes: true,
      uploadedAt: true,
    },
  },
} as const;

async function ensureSeekerProfile(userId: number) {
  let profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    profile = await prisma.jobSeekerProfile.create({
      data: {
        userId,
        firstName: "",
      },
      select: { id: true },
    });
  }

  return profile;
}

async function getOwnedResume(userId: number, resumeId: number) {
  const profile = await ensureSeekerProfile(userId);

  return prisma.resume.findFirst({
    where: {
      id: resumeId,
      seekerProfileId: profile.id,
    },
    select: ownResumeSelect,
  });
}

function withResumeFileUrl<T extends { resumeFile: null | { storagePath: string } }>(resume: T) {
  if (!resume.resumeFile) return resume;

  return {
    ...resume,
    resumeFile: {
      ...resume.resumeFile,
      url: toPublicUploadUrl(resume.resumeFile.storagePath),
    },
  };
}

export async function listMyResumes(userId: number) {
  const profile = await ensureSeekerProfile(userId);

  const resumes = await prisma.resume.findMany({
    where: { seekerProfileId: profile.id },
    orderBy: { updatedAt: "desc" },
    select: ownResumeSelect,
  });

  return resumes.map(withResumeFileUrl);
}

export async function getMyResumeById(userId: number, resumeId: number) {
  const resume = await getOwnedResume(userId, resumeId);
  if (!resume) return null;
  return withResumeFileUrl(resume);
}

export async function createResume(userId: number, data: CreateResumeInput) {
  const profile = await ensureSeekerProfile(userId);

  const resume = await prisma.resume.create({
    data: {
      seekerProfileId: profile.id,
      title: data.title,
      desiredPosition: data.desiredPosition ?? null,
      salaryExpectation: data.salaryExpectation ?? null,
      experienceLevel: data.experienceLevel ?? null,
      skills: data.skills ?? [],
      isPublic: false,
      status: "APPROVED",
    },
    select: ownResumeSelect,
  });

  return withResumeFileUrl(resume);
}

export async function updateResume(userId: number, resumeId: number, data: UpdateResumeInput) {
  const owned = await getOwnedResume(userId, resumeId);
  if (!owned) return null;

  const updated = await prisma.resume.update({
    where: { id: resumeId },
    data: {
      title: data.title ?? owned.title,
      desiredPosition:
        data.desiredPosition !== undefined ? data.desiredPosition : owned.desiredPosition,
      salaryExpectation:
        data.salaryExpectation !== undefined ? data.salaryExpectation : owned.salaryExpectation,
      experienceLevel:
        data.experienceLevel !== undefined ? data.experienceLevel : owned.experienceLevel,
      skills: data.skills ?? owned.skills,
      isPublic: false,
      status: "APPROVED",
    },
    select: ownResumeSelect,
  });

  return withResumeFileUrl(updated);
}

export async function deleteResume(userId: number, resumeId: number) {
  const owned = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      seekerProfile: {
        userId,
      },
    },
    include: {
      resumeFile: true,
    },
  });

  if (!owned) return null;

  if (owned.resumeFile) {
    await removeStoredFileIfExists(owned.resumeFile.storagePath);
  }

  await prisma.resume.delete({
    where: { id: resumeId },
  });

  return true;
}

export async function uploadResumeFile(
  userId: number,
  resumeId: number,
  file: Express.Multer.File | undefined
) {
  if (!file) {
    throw new Error("PDF файл обязателен");
  }



  const owned = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      seekerProfile: {
        userId,
      },
    },
    include: {
      resumeFile: true,
    },
  });

  if (!owned) {
    await removeStoredFileIfExists(toRelativeStoragePath("resume-files", file.filename));
    return null;
  }

  const storagePath = toRelativeStoragePath("resume-files", file.filename);

  if (owned.resumeFile) {
    await removeStoredFileIfExists(owned.resumeFile.storagePath);

    const updated = await prisma.resumeFile.update({
      where: { resumeId: owned.id },
      data: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        storagePath,
        sizeBytes: file.size,
      },
    });

    await prisma.resume.update({
      where: { id: owned.id },
      data: {
        status: "PENDING",
        isPublic: false,
      },
    });

    return {
      ...updated,
      url: toPublicUploadUrl(updated.storagePath),
    };
  }

  const created = await prisma.resumeFile.create({
    data: {
      resumeId: owned.id,
      fileName: file.originalname,
      mimeType: file.mimetype,
      storagePath,
      sizeBytes: file.size,
    },
  });

  await prisma.resume.update({
    where: { id: owned.id },
    data: {
      status: "PENDING",
      isPublic: false,
    },
  });

  return {
    ...created,
    url: toPublicUploadUrl(created.storagePath),
  };
}

export async function getMyResumeFile(userId: number, resumeId: number) {
  const owned = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      seekerProfile: {
        userId,
      },
    },
    include: {
      resumeFile: true,
    },
  });

  if (!owned) return null;
  if (!owned.resumeFile) return { exists: false };

  return {
    exists: true,
    file: {
      ...owned.resumeFile,
      url: toPublicUploadUrl(owned.resumeFile.storagePath),
    },
  };
}

export async function deleteMyResumeFile(userId: number, resumeId: number) {
  const owned = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      seekerProfile: {
        userId,
      },
    },
    include: {
      resumeFile: true,
    },
  });

  if (!owned) return null;
  if (!owned.resumeFile) return { deleted: false };

  await prisma.resumeFile.delete({
    where: { resumeId: owned.id },
  });

  await removeStoredFileIfExists(owned.resumeFile.storagePath);

  return { deleted: true };
}