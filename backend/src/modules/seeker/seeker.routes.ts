import { Router, Response } from "express";
import path from "path";
import { requireAuth, AuthedRequest } from "../../middlewares/auth"; // Исправлено название
import { requireRole } from "../../middlewares/role"; // Исправлено название
import { SeekerService } from "./seeker.service";
import { upload } from "../../utils/uploader"; 
import { prisma } from "../../prisma";

const router = Router();

// Применяем middleware с правильными названиями
router.use(requireAuth as any);

router.get("/profile", requireRole("USER"), async (req: AuthedRequest, res: Response) => {
  // Конвертируем string ID из токена в number для Prisma
  const profile = await SeekerService.getProfile(Number(req.user?.id));
  res.json(profile);
});

router.put("/profile", requireRole("USER"), async (req: AuthedRequest, res: Response) => {
  const updated = await SeekerService.updateProfile(Number(req.user?.id), req.body);
  res.json(updated);
});

router.put("/resume", requireRole("USER"), async (req: AuthedRequest, res: Response) => {
  const profile = await SeekerService.getProfile(Number(req.user?.id));
  const resume = await SeekerService.updateResume(profile.id, req.body);
  res.json(resume);
});

router.post("/resume-file", requireRole("USER"), upload.single("resume"), async (req: AuthedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "Файл не загружен" });

  const profile = await SeekerService.getProfile(Number(req.user?.id));

  const resumeFile = await prisma.resumeFile.upsert({
    where: { seekerProfileId: profile.id },
    update: {
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace('.', ''),
      storagePath: req.file.filename
    },
    create: {
      seekerProfileId: profile.id,
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace('.', ''),
      storagePath: req.file.filename
    }
  });

  res.json(resumeFile);
});

export default router;