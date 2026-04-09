import { prisma } from "../../prisma";
import {
  removeStoredFileIfExists,
  toPublicUploadUrl,
  toRelativeStoragePath,
} from "../uploads/upload.config";

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

export async function listMyPhotos(userId: number) {
  const profile = await ensureSeekerProfile(userId);

  const photos = await prisma.seekerPhoto.findMany({
    where: { seekerProfileId: profile.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return photos.map((photo) => ({
    ...photo,
    url: toPublicUploadUrl(photo.storagePath),
  }));
}

export async function addMyPhotos(userId: number, files: Express.Multer.File[]) {
  const profile = await ensureSeekerProfile(userId);

  if (!files.length) {
    throw new Error("Нужно загрузить хотя бы одно фото");
  }

  const existingCount = await prisma.seekerPhoto.count({
    where: { seekerProfileId: profile.id },
  });

  if (existingCount + files.length > 5) {
    for (const file of files) {
      await removeStoredFileIfExists(toRelativeStoragePath("seeker-photos", file.filename));
    }
    throw new Error("Максимум 5 фото");
  }

  const created = [];
  let nextSortOrder = existingCount;

  for (const file of files) {
    const storagePath = toRelativeStoragePath("seeker-photos", file.filename);

    const photo = await prisma.seekerPhoto.create({
      data: {
        seekerProfileId: profile.id,
        fileName: file.originalname,
        mimeType: file.mimetype,
        storagePath,
        sizeBytes: file.size,
        sortOrder: nextSortOrder++,
      },
    });

    created.push({
      ...photo,
      url: toPublicUploadUrl(photo.storagePath),
    });
  }

  return created;
}

export async function deleteMyPhoto(userId: number, photoId: number) {
  const profile = await ensureSeekerProfile(userId);

  const photo = await prisma.seekerPhoto.findFirst({
    where: {
      id: photoId,
      seekerProfileId: profile.id,
    },
  });

  if (!photo) {
    return null;
  }

  await prisma.seekerPhoto.delete({
    where: { id: photoId },
  });

  await removeStoredFileIfExists(photo.storagePath);

  return true;
}