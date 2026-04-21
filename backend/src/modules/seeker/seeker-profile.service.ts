import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma";
import { UpdateSeekerProfileInput } from "./seeker-profile.schemas";
import { toPublicUploadUrl } from "../uploads/upload.config";

const ownSeekerProfileSelect = Prisma.validator<Prisma.JobSeekerProfileSelect>()({
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  location: true,
  headline: true,
  summary: true,
  phone: true,
  experienceLevel: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
  photos: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      storagePath: true,
      sizeBytes: true,
      sortOrder: true,
      createdAt: true,
    },
  },
  resumes: {
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      desiredPosition: true,
      salaryExpectation: true,
      experienceLevel: true,
      skills: true,
      isPublic: true,
      status: true,
      updatedAt: true,
    },
  },
});

type OwnSeekerProfile = Prisma.JobSeekerProfileGetPayload<{
  select: typeof ownSeekerProfileSelect;
}>;

async function ensureSeekerProfile(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "USER") {
    throw new Error("Only job seekers can have seeker profile");
  }

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

function mapProfile(profile: OwnSeekerProfile) {
  return {
    ...profile,
    avatarUrl: profile.avatarUrl
      ? toPublicUploadUrl(profile.avatarUrl.replace(/^\/+/, ""))
      : null,
    photos: profile.photos.map((photo) => ({
      ...photo,
      url: toPublicUploadUrl(photo.storagePath),
    })),
  };
}

export async function getMySeekerProfile(userId: number) {
  await ensureSeekerProfile(userId);

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: ownSeekerProfileSelect,
  });

  if (!profile) {
    return null;
  }

  return mapProfile(profile);
}

export async function updateMySeekerProfile(
  userId: number,
  data: UpdateSeekerProfileInput
) {
  await ensureSeekerProfile(userId);

  const current = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      location: true,
      headline: true,
      summary: true,
      phone: true,
      experienceLevel: true,
    },
  });

  if (!current) {
    throw new Error("Seeker profile not found");
  }

  const profile = await prisma.jobSeekerProfile.update({
    where: { userId },
    data: {
      firstName: data.firstName ?? current.firstName,
      lastName: data.lastName !== undefined ? data.lastName : current.lastName,
      location: data.location !== undefined ? data.location : current.location,
      headline: data.headline !== undefined ? data.headline : current.headline,
      summary: data.summary !== undefined ? data.summary : current.summary,
      phone: data.phone !== undefined ? data.phone : current.phone,
      experienceLevel:
        data.experienceLevel !== undefined
          ? data.experienceLevel
          : current.experienceLevel,
    },
    select: ownSeekerProfileSelect,
  });

  return mapProfile(profile);
}