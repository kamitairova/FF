import { Router } from "express";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validateBody } from "../../middlewares/validate";
import { updateSeekerProfileSchema } from "./seeker-profile.schemas";
import * as SeekerProfile from "./seeker-profile.service";

export const seekerProfileRouter = Router();

seekerProfileRouter.get(
  "/profile",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const profile = await SeekerProfile.getMySeekerProfile(Number(req.user!.id));
    res.json({ profile });
  }
);

seekerProfileRouter.patch(
  "/profile",
  requireAuth,
  requireRole("USER"),
  validateBody(updateSeekerProfileSchema),
  async (req: AuthedRequest, res) => {
    const profile = await SeekerProfile.updateMySeekerProfile(Number(req.user!.id), req.body);
    res.json({ profile });
  }
);