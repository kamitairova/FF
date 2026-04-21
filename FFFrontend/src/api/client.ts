import type { ApiError } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function toApiError(status: number, payload: any): ApiError {
  if (payload?.message && Array.isArray(payload?.errors)) {
    const details: Record<string, string> = {};
    for (const e of payload.errors) {
      if (e?.path) details[String(e.path)] = e.message ?? "Invalid";
    }
    return { status, message: payload.message, details };
  }
  if (payload?.message) return { status, message: payload.message };
  return { status, message: "Request failed" };
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");

  // --- ДОБАВЛЕНО: Автоматический поиск токена ---
  // Если токен не передан в аргументах (opts.token), берем его из localStorage
  const token = opts.token || localStorage.getItem("jobsearch_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // ----------------------------------------------

  const isForm = opts.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...opts, headers });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) throw toApiError(res.status, payload);
  return payload as T;
}