import { Router, Response } from "express";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { seekerAvatarUpload } from "./seeker-avatar.upload";
import * as SeekerAvatarService from "./seeker-avatar.service";

export const seekerAvatarRouter = Router();

seekerAvatarRouter.post(
  "/profile/avatar",
  requireAuth,
  requireRole("USER"),
  seekerAvatarUpload.single("avatar"),
  async (req: AuthedRequest, res: Response, next) => {
    try {
      const userId = Number(req.user!.userId);
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Файл аватара обязателен",
          },
        });
      }

      const profile = await SeekerAvatarService.uploadMyAvatar(userId, file);

      return res.status(201).json({
        profile,
        avatarUrl: profile.avatarUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);

seekerAvatarRouter.delete(
  "/profile/avatar",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res: Response, next) => {
    try {
      const userId = Number(req.user!.userId);
      const profile = await SeekerAvatarService.deleteMyAvatar(userId);

      return res.json({
        profile,
        avatarUrl: profile.avatarUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);