import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  salaryFrom: z.number().int().positive().optional(),
  salaryTo: z.number().int().positive().optional(),
  city: z.string().min(2).optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const approveSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});