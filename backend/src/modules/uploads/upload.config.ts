import fs from "fs";
import path from "path";
import multer from "multer";
import type { Request } from "express";

const uploadsRoot = path.join(process.cwd(), "uploads");
const seekerPhotosDir = path.join(uploadsRoot, "seeker-photos");
const seekerAvatarsDir = path.join(uploadsRoot, "seeker-avatars");

fs.mkdirSync(seekerPhotosDir, { recursive: true });
fs.mkdirSync(seekerAvatarsDir, { recursive: true });

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

export const seekerPhotosUpload = multer({
  storage: seekerPhotosStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

export const seekerAvatarUpload = multer({
  storage: seekerAvatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});