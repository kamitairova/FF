import { ExperienceLevel } from "@prisma/client";
import { z } from "zod";

export const updateSeekerProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Имя обязательно").max(60, "Слишком длинное имя").optional(),
  lastName: z.string().trim().max(60, "Слишком длинная фамилия").nullable().optional(),
  location: z.string().trim().max(120, "Слишком длинная локация").nullable().optional(),
  headline: z.string().trim().max(140, "Слишком длинный заголовок").nullable().optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).nullable().optional(),
});

export type UpdateSeekerProfileInput = z.infer<typeof updateSeekerProfileSchema>;