import React from "react";
import { ApiError } from "../api/types";

export function FieldError({ err, field }: { err: ApiError | null; field: string }) {
  const msg = err?.details?.[field];
  if (!msg) return null;
  return <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6, fontWeight: 700 }}>{msg}</div>;
}
