import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("❌ Error:", err);

  const status = err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";

  return res.status(status).json({ message });
}