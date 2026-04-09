import { Router } from "express";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { seekerPhotoUpload } from "../uploads/upload.config";
import * as SeekerPhotos from "./seeker-photos.service";

export const seekerPhotosRouter = Router();

seekerPhotosRouter.get(
  "/profile/photos",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const photos = await SeekerPhotos.listMyPhotos(Number(req.user!.id));
    res.json({ photos });
  }
);

seekerPhotosRouter.post(
  "/profile/photos",
  requireAuth,
  requireRole("USER"),
  seekerPhotoUpload.array("photos", 5),
  async (req: AuthedRequest, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    const photos = await SeekerPhotos.addMyPhotos(Number(req.user!.id), files);
    res.status(201).json({ photos });
  }
);

seekerPhotosRouter.delete(
  "/profile/photos/:photoId",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const deleted = await SeekerPhotos.deleteMyPhoto(
      Number(req.user!.id),
      Number(req.params.photoId)
    );

    if (!deleted) {
      return res.status(404).json({ message: "Фото не найдено" });
    }

    res.status(204).send();
  }
);