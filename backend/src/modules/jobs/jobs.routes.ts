import { Router } from "express";
import { Request, Response } from "express";
import { validateBody } from "../../middlewares/validate";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { createJobSchema, updateJobSchema } from "./jobs.schemas";
import * as Jobs from "./jobs.service";

export const jobsRouter = Router();

/**
 * GET /api/jobs
 */
jobsRouter.get("/", async (req: Request, res: Response) => {
  const result = await Jobs.listPublicJobs(req.query);
  res.json(result);
});

/**
 * GET /api/jobs/my/list
 */
jobsRouter.get(
  "/my/list",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res: Response) => {
    const companyId = req.user!.userId; // ✅ фикс
    const items = await Jobs.listMyJobs(companyId);
    res.json({ items });
  }
);

/**
 * GET /api/jobs/my/:id
 */
jobsRouter.get(
  "/my/:id",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res: Response) => {
    const companyId = req.user!.userId; // ✅ фикс
    const id = Number(req.params.id);

    const job = await Jobs.getMyJobById(companyId, id);

    if (!job) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ job });
  }
);

/**
 * GET /api/jobs/:id
 */
jobsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const job = await Jobs.getPublicJobById(id);

  if (!job) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({ job });
});

/**
 * POST /api/jobs
 */
jobsRouter.post(
  "/",
  requireAuth,
  requireRole("COMPANY"),
  validateBody(createJobSchema),
  async (req: AuthedRequest, res: Response) => {
    const companyId = req.user!.userId; // ✅ фикс
    const job = await Jobs.createJob(companyId, req.body);
    res.status(201).json({ job });
  }
);

/**
 * PATCH /api/jobs/:id
 */
jobsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("COMPANY"),
  validateBody(updateJobSchema),
  async (req: AuthedRequest, res: Response) => {
    const companyId = req.user!.userId; // ✅ фикс
    const id = Number(req.params.id);

    const result = await Jobs.updateJob(companyId, id, req.body);

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ job: result });
  }
);

/**
 * DELETE /api/jobs/:id
 */
jobsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res: Response) => {
    const companyId = req.user!.userId; // ✅ фикс
    const id = Number(req.params.id);

    const result = await Jobs.deleteJob(companyId, id);

    if (result === null) {
      return res.status(404).json({ message: "Not found" });
    }

    if (result === "FORBIDDEN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(204).send();
  }
);

/**
 * GET /api/jobs/saved
 */
jobsRouter.get(
  "/saved",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res: Response) => {
    const result = await Jobs.listSavedJobs(req.user!.userId, req.query);
    res.json(result);
  }
);

/**
 * GET /api/jobs/:id/saved-status
 */
jobsRouter.get(
  "/:id/saved-status",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const saved = await Jobs.isJobSaved(req.user!.userId, id);
    res.json({ saved });
  }
);

/**
 * POST /api/jobs/:id/save
 */
jobsRouter.post(
  "/:id/save",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const result = await Jobs.saveJob(req.user!.userId, id);

    if (!result) {
      return res.status(404).json({ message: "Vacancy not found" });
    }

    res.status(201).json({ ok: true });
  }
);

/**
 * DELETE /api/jobs/:id/save
 */
jobsRouter.delete(
  "/:id/save",
  requireAuth,
  requireRole("USER"),
  async (req: AuthedRequest, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    await Jobs.unsaveJob(req.user!.userId, id);
    res.json({ ok: true });
  }
);