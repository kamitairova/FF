import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../prisma";
import { signToken } from "../../utils/jwt";
import { validateBody } from "../../middlewares/validate";
import { requireAuth, AuthedRequest } from "../../middlewares/auth";
import { loginSchema, registerSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  type PublicRole = "USER" | "COMPANY";

  const { email, password, role } = req.body as {
    email: string;
    password: string;
    role?: PublicRole;
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const safeRole: PublicRole = role === "COMPANY" ? "COMPANY" : "USER";

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: safeRole,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
  });

  const token = signToken({ userId: user.id.toString(), role: user.role });

  return res.status(201).json({ user, token });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.isDisabled) {
    return res.status(403).json({ message: "User is disabled" });
  }

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id.toString(), role: user.role });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isDisabled: user.isDisabled,
      createdAt: user.createdAt,
    },
    token,
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const userId = parseInt(req.user!.id, 10);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user });
});