import { z } from "zod";

const employmentTypeEnum = z.enum(["FULL_TIME", "PART_TIME"]);
const workModeEnum = z.enum(["REMOTE", "ONSITE", "HYBRID"]);
const experienceLevelEnum = z.enum(["INTERN", "JUNIOR", "MIDDLE", "SENIOR", "LEAD"]);
const sortEnum = z.enum(["newest", "relevance", "salary_asc", "salary_desc"]);

const jobBaseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  salaryFrom: z.number().int().nonnegative().optional(),
  salaryTo: z.number().int().nonnegative().optional(),
  city: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  employmentType: employmentTypeEnum.optional(),
  workMode: workModeEnum.optional(),
  experienceLevel: experienceLevelEnum.optional(),
  requiredSkills: z.array(z.string().min(1)).optional(),
});

export const createJobSchema = jobBaseSchema.refine(
  (data) =>
    data.salaryFrom === undefined ||
    data.salaryTo === undefined ||
    data.salaryFrom <= data.salaryTo,
  {
    path: ["salaryTo"],
    message: "salaryTo must be greater than or equal to salaryFrom",
  }
);

export const updateJobSchema = jobBaseSchema.partial().refine(
  (data) =>
    data.salaryFrom === undefined ||
    data.salaryTo === undefined ||
    data.salaryFrom <= data.salaryTo,
  {
    path: ["salaryTo"],
    message: "salaryTo must be greater than or equal to salaryFrom",
  }
);

export const approveSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "REMOVED"]),
});

export const listPublicJobsQuerySchema = z.object({
  q: z.string().trim().optional(),
  location: z.string().trim().optional(),
  category: z.string().trim().optional(),

  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),

  employmentType: employmentTypeEnum.optional(),
  workMode: workModeEnum.optional(),
  experienceLevel: experienceLevelEnum.optional(),

  sort: sortEnum.default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListPublicJobsQuery = z.infer<typeof listPublicJobsQuerySchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;