import React from "react";
import { ApiError } from "../api/types";

export function FieldError({ err, field }: { err: ApiError | null; field: string }) {
  const msg = err?.details?.[field];
  if (!msg) return null;
  return <div className="field-error">{msg}</div>;
}
