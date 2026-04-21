import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const avatarDir = path.join(uploadDir, "seeker-avatars");

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

export const seekerAvatarUpload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Недопустимый тип файла. Разрешены JPG, JPEG, PNG, WEBP"));
    }
  },
});