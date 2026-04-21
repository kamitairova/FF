import { z } from "zod";

export const createApplicationThreadSchema = z.object({
  vacancyId: z.number().int().positive(),
});

export const createInvitationThreadSchema = z.object({
  seekerProfileId: z.number().int().positive(),
  vacancyId: z.number().int().positive(),
});

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Сообщение не должно быть пустым")
    .max(4000, "Сообщение слишком длинное"),
});