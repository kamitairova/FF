import fs from "fs";
import path from "path";
import { prisma } from "../../prisma";

function ensureUploadsDir() {
  const dir = path.join(process.cwd(), "uploads", "seeker-avatars");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function normalizeSlashes(value: string) {
  return value.replace(/\\/g, "/");
}

function toPublicAvatarUrl(storagePath?: string | null) {
  if (!storagePath) return null;
  return `/${normalizeSlashes(storagePath).replace(/^\/+/, "")}`;
}

async function removeFileIfExists(storagePath?: string | null) {
  if (!storagePath) return;

  const normalized = normalizeSlashes(storagePath).replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), normalized);

  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    await fs.promises.unlink(absolutePath);
  } catch {
    // файл уже удалён или недоступен — ничего страшного
  }
}

async function ensureSeekerProfile(userId: number) {
  const existing = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (existing) return existing;

  return prisma.jobSeekerProfile.create({
    data: {
      userId,
      firstName: "",
    },
    select: { id: true },
  });
}

function mapProfile(profile: {
  id: number;
  userId: number;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  location: string | null;
  headline: string | null;
  experienceLevel: any;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...profile,
    avatarUrl: toPublicAvatarUrl(profile.avatarUrl),
  };
}

/**
 * Основной метод загрузки аватара
 */
export async function uploadMyAvatar(userId: number, file: Express.Multer.File) {
  ensureUploadsDir();
  await ensureSeekerProfile(userId);

  const currentProfile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: {
      avatarUrl: true,
    },
  });

  const relativePath = path
    .join("uploads", "seeker-avatars", file.filename)
    .replace(/\\/g, "/");

  const updated = await prisma.jobSeekerProfile.update({
    where: { userId },
    data: {
      avatarUrl: relativePath,
    },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      location: true,
      headline: true,
      experienceLevel: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (currentProfile?.avatarUrl && currentProfile.avatarUrl !== relativePath) {
    await removeFileIfExists(currentProfile.avatarUrl);
  }

  return mapProfile(updated);
}

/**
 * Удаление текущего аватара
 */
export async function deleteMyAvatar(userId: number) {
  await ensureSeekerProfile(userId);

  const currentProfile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: {
      avatarUrl: true,
    },
  });

  const updated = await prisma.jobSeekerProfile.update({
    where: { userId },
    data: {
      avatarUrl: null,
    },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      location: true,
      headline: true,
      experienceLevel: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (currentProfile?.avatarUrl) {
    await removeFileIfExists(currentProfile.avatarUrl);
  }

  return mapProfile(updated);
}