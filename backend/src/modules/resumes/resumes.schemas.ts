import { ExperienceLevel } from "@prisma/client";
import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().trim().min(1, "Название обязательно").max(120, "Слишком длинное название"),
  desiredPosition: z.string().trim().max(120, "Слишком длинная должность").nullable().optional(),
  salaryExpectation: z.number().int().nonnegative().nullable().optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).nullable().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  isPublic: z.boolean().optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().trim().min(1, "Название обязательно").max(120, "Слишком длинное название").optional(),
  desiredPosition: z.string().trim().max(120, "Слишком длинная должность").nullable().optional(),
  salaryExpectation: z.number().int().nonnegative().nullable().optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).nullable().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  isPublic: z.boolean().optional(),
});

export const listPublicResumesQuerySchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(30).default(12),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;