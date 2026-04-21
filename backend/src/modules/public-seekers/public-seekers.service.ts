import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma";
import { listPublicResumesQuerySchema } from "../resumes/resumes.schemas";
import { toPublicUploadUrl } from "../uploads/upload.config";

const publicResumeSelect = Prisma.validator<Prisma.ResumeSelect>()({
  id: true,
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
  seekerProfile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      location: true,
      headline: true,
      experienceLevel: true,
      photos: {
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: {
          id: true,
          storagePath: true,
        },
      },
    },
  },
});

type PublicResume = Prisma.ResumeGetPayload<{
  select: typeof publicResumeSelect;
}>;

function mapResume(resume: PublicResume) {
  return {
    ...resume,
    resumeFile: resume.resumeFile
      ? {
          ...resume.resumeFile,
          url: toPublicUploadUrl(resume.resumeFile.storagePath),
        }
      : null,
    seekerProfile: {
      ...resume.seekerProfile,
      photos: resume.seekerProfile.photos.map((photo) => ({
        id: photo.id,
        url: toPublicUploadUrl(photo.storagePath),
      })),
    },
  };
}

export async function listPublicResumes(rawQuery: unknown) {
  const query = listPublicResumesQuerySchema.parse(rawQuery);
  const { q, page, pageSize } = query;

  const where: Prisma.ResumeWhereInput = {
    isPublic: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { desiredPosition: { contains: q, mode: "insensitive" } },
            { skills: { hasSome: [q] } },
            {
              seekerProfile: {
                OR: [
                  { firstName: { contains: q, mode: "insensitive" } },
                  { lastName: { contains: q, mode: "insensitive" } },
                  { headline: { contains: q, mode: "insensitive" } },
                  { location: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.resume.count({ where }),
    prisma.resume.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicResumeSelect,
    }),
  ]);

  return {
    data: items.map(mapResume),
    page,
    pageSize,
    total,
  };
}

export async function getPublicResumeById(resumeId: number) {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      isPublic: true,
    },
    select: publicResumeSelect,
  });

  if (!resume) return null;

  return mapResume(resume);
}

export async function getPublicSeekerProfileById(seekerProfileId: number) {
  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { id: seekerProfileId },
    include: {
      photos: {
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
      },
      resumes: {
        where: { isPublic: true },
        orderBy: { updatedAt: "desc" },
        include: {
          resumeFile: true,
        },
      },
    },
  });

  if (!profile) return null;

    return {
    ...profile,
    avatarUrl: profile.avatarUrl
      ? toPublicUploadUrl(profile.avatarUrl.replace(/^\/+/, ""))
      : null,
    photos: profile.photos.map((photo) => ({
      ...photo,
      url: toPublicUploadUrl(photo.storagePath),
    })),
    resumes: profile.resumes.map((resume) => ({
      ...resume,
      resumeFile: resume.resumeFile
        ? {
            ...resume.resumeFile,
            url: toPublicUploadUrl(resume.resumeFile.storagePath),
          }
        : null,
    })),
  };
}