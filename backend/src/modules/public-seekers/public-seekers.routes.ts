import { Router } from "express";
import * as PublicSeekers from "./public-seekers.service";

export const publicSeekersRouter = Router();

publicSeekersRouter.get("/resumes", async (req, res) => {
  const result = await PublicSeekers.listPublicResumes(req.query);
  res.json(result);
});

publicSeekersRouter.get("/resumes/:resumeId", async (req, res) => {
  const resumeId = Number(req.params.resumeId);

  if (Number.isNaN(resumeId)) {
    return res.status(400).json({ message: "Некорректный id резюме" });
  }

  const resume = await PublicSeekers.getPublicResumeById(resumeId);

  if (!resume) {
    return res.status(404).json({ message: "Резюме не найдено" });
  }

  res.json({ resume });
});

publicSeekersRouter.get("/seekers/:seekerProfileId", async (req, res) => {
  const seekerProfileId = Number(req.params.seekerProfileId);

  if (Number.isNaN(seekerProfileId)) {
    return res.status(400).json({ message: "Некорректный id профиля" });
  }

  const profile = await PublicSeekers.getPublicSeekerProfileById(seekerProfileId);

  if (!profile) {
    return res.status(404).json({ message: "Профиль не найден" });
  }

  res.json({ profile });
});