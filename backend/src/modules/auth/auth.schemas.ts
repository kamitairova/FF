import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "COMPANY"]).optional(), // по умолчанию USER
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
