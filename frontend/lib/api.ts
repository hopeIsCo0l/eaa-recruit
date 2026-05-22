"use client";

// Shared client for all Spring API calls from the browser.
// - Reads the JWT from the eaa_jwt cookie (set at login) and attaches it
// - Unwraps Spring's ApiResponse<T> envelope
// - Surfaces 401 (kicks back to /login), 429 (retryAfter), and generic errors
//   in a uniform shape so pages don't need to repeat the dance.

const COOKIE_NAME = "eaa_jwt";

export type ApiEnvelope<T> = {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
};

export type ApiError = {
  status: number;
  message: string;
  retryAfter?: number;
};

export type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const [k, ...rest] = c.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("eaa_session");
  } catch {}
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?next=${next}`);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean; redirectOn401?: boolean } = {},
): Promise<ApiResult<T>> {
  const { auth = true, redirectOn401 = true } = opts;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = readCookie(COOKIE_NAME);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch (e) {
    return { data: null, error: { status: 0, message: "Network error" } };
  }

  if (res.status === 401 && auth && redirectOn401) {
    redirectToLogin();
    return { data: null, error: { status: 401, message: "Session expired" } };
  }

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "0");
    let msg = `Too many requests. Try again in ${retryAfter || "a few"} seconds.`;
    try {
      const body = (await res.json()) as ApiEnvelope<unknown>;
      if (body.message) msg = body.message;
    } catch {}
    return { data: null, error: { status: 429, message: msg, retryAfter } };
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {}

  if (!res.ok || !body || body.status !== "success") {
    const message =
      body?.message ??
      body?.errors?.[0]?.message ??
      `Request failed (${res.status})`;
    return { data: null, error: { status: res.status, message } };
  }

  return { data: (body.data as T) ?? (null as unknown as T), error: null };
}

export async function apiDownload(path: string): Promise<Blob | null> {
  const headers = new Headers();
  const token = readCookie(COOKIE_NAME);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { headers });
  if (res.status === 401) {
    redirectToLogin();
    return null;
  }
  if (!res.ok) return null;
  return await res.blob();
}
