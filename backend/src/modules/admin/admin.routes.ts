import { Request, Response, Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { requireRole } from "../../middlewares/role";
import * as Admin from "./admin.service";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/metrics", async (_req: Request, res: Response) => {
  const data = await Admin.getMetrics();
  res.json(data);
});

adminRouter.get("/users", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);

  const data = await Admin.listUsers({ page, pageSize });
  res.json(data);
});

adminRouter.patch("/users/:id/disable", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await Admin.disableUser(id);
  res.json({ user });
});

adminRouter.patch("/users/:id/enable", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await Admin.enableUser(id);
  res.json({ user });
});

adminRouter.get("/jobs", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const data = await Admin.listJobs({ page, pageSize, status });
  res.json(data);
});

adminRouter.patch("/jobs/:id/approve", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const job = await Admin.setJobStatus(id, "APPROVED");
  res.json({ job });
});

adminRouter.patch("/jobs/:id/reject", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const job = await Admin.setJobStatus(id, "REJECTED");
  res.json({ job });
});

adminRouter.patch("/jobs/:id/remove", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const job = await Admin.setJobStatus(id, "REMOVED");
  res.json({ job });
});