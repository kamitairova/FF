import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { Role } from "@prisma/client";

export type AuthedRequest = Request & {
  user?: { userId: number; role: Role };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.user = {
      userId: Number(payload.userId),
      role: payload.role as Role,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(role: Role) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}