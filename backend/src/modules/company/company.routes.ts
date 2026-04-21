import { Router } from "express";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import * as Company from "./company.service";

export const companyRouter = Router();

companyRouter.get(
  "/profile",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    const profile = await Company.getCompanyProfileByUserId(Number(req.user!.userId));
    res.json({ profile });
  }
);

companyRouter.patch(
  "/profile",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    const updated = await Company.updateCompanyProfileByUserId(
      Number(req.user!.userId),
      req.body
    );
    res.json({ profile: updated });
  }
);

companyRouter.get(
  "/profile/photos",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    const photos = await Company.getPhotos(Number(req.user!.userId));
    res.json({ photos });
  }
);

companyRouter.post(
  "/profile/photos",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    const photo = await Company.addPhoto(Number(req.user!.userId), req.body.imageUrl);
    res.json({ photo });
  }
);

companyRouter.delete(
  "/profile/photos/:id",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    await Company.deletePhoto(Number(req.user!.userId), Number(req.params.id));
    res.status(204).send();
  }
);