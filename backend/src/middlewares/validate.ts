import { ZodObject, ZodError, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateBody =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.issues.reduce<Record<string, string>>((acc, issue: ZodIssue) => {
              const key = issue.path.join(".") || "body";
              acc[key] = issue.message;
              return acc;
            }, {}),
          },
        });
      }

      next(error);
    }
  };