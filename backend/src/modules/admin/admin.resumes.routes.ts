import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { prisma } from "../../prisma";
import { removeStoredFileIfExists } from "../../modules/uploads/upload.config";

const router = Router();

// Получить все pending резюме
router.get(
  "/resumes",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const status = (req.query.status as string) || "PENDING";

    const resumes = await prisma.resume.findMany({
      where: {
        status: status as any,
      },
      include: {
        seekerProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ data: resumes });
  }
);

// APPROVE
router.patch(
  "/resumes/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const id = Number(req.params.id);

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        status: "APPROVED",
        isPublic: true,
      },
    });

    res.json({ resume });
  }
);

// REJECT
router.patch(
  "/resumes/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const id = Number(req.params.id);

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        status: "REJECTED",
        isPublic: false,
      },
    });

    res.json({ resume });
  }
);

router.delete(
  "/resumes/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const id = Number(req.params.id);

    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        resumeFile: true,
      },
    });

    if (!resume) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Резюме не найдено",
        },
      });
    }

    if (resume.resumeFile) {
      await removeStoredFileIfExists(resume.resumeFile.storagePath);
    }

    await prisma.resume.delete({
      where: { id },
    });

    return res.json({ success: true });
  }
);

export { router as adminResumesRouter };