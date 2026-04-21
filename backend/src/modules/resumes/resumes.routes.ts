import { Router } from "express";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { validateBody } from "../../middlewares/validate";
import { resumePdfUpload } from "../uploads/upload.config";
import { createResumeSchema, updateResumeSchema } from "./resumes.schemas";
import * as Resumes from "./resumes.service";

export const resumesRouter = Router();

resumesRouter.get(
  "/resumes",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const items = await Resumes.listMyResumes(Number(req.user!.userId));
    res.json({ items });
  }
);

resumesRouter.post(
  "/resumes",
  requireAuth,
  requireRole("USER"),
  validateBody(createResumeSchema),
  async (req: AuthedRequest, res) => {
    const resume = await Resumes.createResume(Number(req.user!.userId), req.body);
    res.status(201).json({ resume });
  }
);

resumesRouter.get(
  "/resumes/:resumeId",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const resume = await Resumes.getMyResumeById(Number(req.user!.userId), Number(req.params.resumeId));

    if (!resume) {
      return res.status(404).json({ message: "Резюме не найдено" });
    }

    res.json({ resume });
  }
);

resumesRouter.patch(
  "/resumes/:resumeId",
  requireAuth,
  requireRole("USER"),
  validateBody(updateResumeSchema),
  async (req: AuthedRequest, res) => {
    const resume = await Resumes.updateResume(
      Number(req.user!.userId),
      Number(req.params.resumeId),
      req.body
    );

    if (!resume) {
      return res.status(404).json({ message: "Резюме не найдено" });
    }

    res.json({ resume });
  }
);

resumesRouter.delete(
  "/resumes/:resumeId",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const deleted = await Resumes.deleteResume(Number(req.user!.userId), Number(req.params.resumeId));

    if (!deleted) {
      return res.status(404).json({ message: "Резюме не найдено" });
    }

    res.status(204).send();
  }
);

resumesRouter.post(
  "/resumes/:resumeId/file",
  requireAuth,
  requireRole("USER"),
  resumePdfUpload.single("file"),
  async (req: AuthedRequest, res) => {
    const file = req.file;
    const result = await Resumes.uploadResumeFile(
      Number(req.user!.userId),
      Number(req.params.resumeId),
      file
    );

    if (!result) {
      return res.status(404).json({ message: "Резюме не найдено" });
    }

    res.status(201).json({ file: result });
  }
);

resumesRouter.get(
  "/resumes/:resumeId/file",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const result = await Resumes.getMyResumeFile(
      Number(req.user!.userId),
      Number(req.params.resumeId)
    );

    if (!result) {
      return res.status(404).json({ message: "Резюме не найдено" });
    }

    res.json(result);
  }
);

resumesRouter.delete(
  "/resumes/:resumeId/file",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res) => {
    const result = await Resumes.deleteMyResumeFile(
      Number(req.user!.userId),
      Number(req.params.resumeId)
    );

    if (!result) {
      return res.status(404).json({ message: "Резюме не найдено" });
    }

    res.json(result);
  }
);