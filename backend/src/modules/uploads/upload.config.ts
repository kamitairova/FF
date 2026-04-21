import fs from "fs";
import path from "path";
import multer from "multer";
import type { Request } from "express";

const uploadsRoot = path.join(process.cwd(), "uploads");
const seekerPhotosDir = path.join(uploadsRoot, "seeker-photos");
const seekerAvatarsDir = path.join(uploadsRoot, "seeker-avatars");
const resumeFilesDir = path.join(uploadsRoot, "resume-files");

fs.mkdirSync(seekerPhotosDir, { recursive: true });
fs.mkdirSync(seekerAvatarsDir, { recursive: true });
fs.mkdirSync(resumeFilesDir, { recursive: true });

function makeSafeFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base || "file"}${ext}`;
}

function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Разрешены только JPG, PNG и WEBP"));
    return;
  }

  cb(null, true);
}

// 🔥 ВАЖНО: разрешаем любые файлы
const fileFilter: multer.Options["fileFilter"] = (_req, _file, cb) => {
  cb(null, true);
};

const seekerPhotosStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, seekerPhotosDir);
  },
  filename: (_req, file, cb) => {
    cb(null, makeSafeFileName(file.originalname));
  },
});

const seekerAvatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, seekerAvatarsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, makeSafeFileName(file.originalname));
  },
});

const resumePdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumeFilesDir);
  },
  filename: (_req, file, cb) => {
    cb(null, makeSafeFileName(file.originalname));
  },
});

export const seekerPhotosUpload = multer({
  storage: seekerPhotosStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

/**
 * Алиас для старого имени импорта:
 * seeker-photos.routes.ts сейчас импортирует seekerPhotoUpload
 */
export const seekerPhotoUpload = seekerPhotosUpload;

export const seekerAvatarUpload = multer({
  storage: seekerAvatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export const resumePdfUpload = multer({
  storage: resumePdfStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export function toRelativeStoragePath(folder: string, fileName: string) {
  return path.join("uploads", folder, fileName).replace(/\\/g, "/");
}

export function toPublicUploadUrl(storagePath: string) {
  return "http://localhost:5000/" + storagePath.replace(/\\/g, "/");
}

export async function removeStoredFileIfExists(storagePath?: string | null) {
  if (!storagePath) return;

  const normalized = storagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), normalized);

  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    await fs.promises.unlink(absolutePath);
  } catch {
    // файл уже отсутствует — ничего страшного
  }
}