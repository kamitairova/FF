import { Router } from "express";
import { validateBody } from "../../middlewares/validate";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import { createJobSchema, updateJobSchema, approveSchema } from "./jobs.schemas";
import * as Jobs from "./jobs.service";

export const jobsRouter = Router();

/**
 * GET /api/jobs
 */
jobsRouter.get("/", async (_req, res) => {
  const items = await Jobs.listPublicJobs();
  res.json({ items });
});

/**
 * GET /api/jobs/my
 */
jobsRouter.get(
  "/my/list",
  requireAuth,
  requireRole("COMPANY"),
  async (req: AuthedRequest, res) => {
    const companyId = parseInt(req.user!.id);
    const items = await Jobs.listMyJobs(companyId);
    res.json({ items });
  }
);

/**
 * GET /api/jobs/:id
 */
jobsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const job = await Jobs.getJobById(id);
  if (!job) return res.status(404).json({ message: "Not found" });

  if (job.status !== "APPROVED") {
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
  async (req: AuthedRequest, res) => {
    const companyId = parseInt(req.user!.id);
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
  async (req: AuthedRequest, res) => {
    const companyId = parseInt(req.user!.id);
    const id = Number(req.params.id);

    const result = await Jobs.updateJob(companyId, id, req.body);
    if (result === null) return res.status(404).json({ message: "Not found" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Forbidden" });

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
  async (req: AuthedRequest, res) => {
    const companyId = parseInt(req.user!.id);
    const id = Number(req.params.id);

    const result = await Jobs.deleteJob(companyId, id);
    if (result === null) return res.status(404).json({ message: "Not found" });
    if (result === "FORBIDDEN") return res.status(403).json({ message: "Forbidden" });

    res.status(204).send();
  }
);