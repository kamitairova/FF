import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth";

export function requireRole(...roles: Array<"USER" | "COMPANY" | "ADMIN">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (!roles.includes(req.user.role as any)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}