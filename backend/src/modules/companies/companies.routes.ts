import { Router } from "express";
import * as Companies from "./companies.service";

export const companiesRouter = Router();

companiesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const company = await Companies.getPublicCompanyProfile(id);

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  res.json({ company });
});

companiesRouter.get("/:id/jobs", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const jobs = await Companies.getPublicCompanyJobs(id);
  res.json({ items: jobs });
});