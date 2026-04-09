import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import { prisma } from "../../prisma";

function removeLocalFile(relativeUrl?: string | null) {
  if (!relativeUrl) return;
  if (!relativeUrl.startsWith("/uploads/")) return;

  const filePath = path.join(process.cwd(), relativeUrl.replace(/^\//, ""));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function uploadSeekerAvatar(req: Request, res: Response) {
  const userId = req.user!.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Файл аватарки не загружен",
      },
    });
  }

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Профиль соискателя не найден",
      },
    });
  }

  const avatarUrl = `/uploads/seeker-avatars/${file.filename}`;

  const updatedProfile = await prisma.jobSeekerProfile.update({
    where: { userId },
    data: { avatarUrl },
  });

  if (
    profile.avatarUrl &&
    profile.avatarUrl.startsWith("/uploads/seeker-avatars/")
  ) {
    removeLocalFile(profile.avatarUrl);
  }

  return res.json({
    profile: updatedProfile,
    avatarUrl,
  });
}

export async function deleteSeekerAvatar(req: Request, res: Response) {
  const userId = req.user!.id;

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Профиль соискателя не найден",
      },
    });
  }

  if (
    profile.avatarUrl &&
    profile.avatarUrl.startsWith("/uploads/seeker-avatars/")
  ) {
    removeLocalFile(profile.avatarUrl);
  }

  const updatedProfile = await prisma.jobSeekerProfile.update({
    where: { userId },
    data: { avatarUrl: null },
  });

  return res.json({
    profile: updatedProfile,
    avatarUrl: null,
  });
}