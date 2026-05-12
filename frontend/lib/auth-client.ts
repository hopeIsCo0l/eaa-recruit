"use client";

type ApiEnvelope<T> = {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
};

type LoginResponse = {
  token: string;
  userId: number;
  email: string;
  role: string;
  fullName: string;
};

export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
};

const COOKIE_NAME = "eaa_jwt";
const STORAGE_KEY = "eaa_session";

function writeCookie(value: string, days = 7) {
  const expires = new Date(Date.now() + days * 86400_000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires}; SameSite=Lax`;
}

function clearCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function persistSession(s: Session) {
  writeCookie(s.token);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function clearSession() {
  clearCookie();
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function unwrap<T>(res: Response): Promise<{ data: T | null; error: { message: string } | null }> {
  let body: ApiEnvelope<T> | null = null;
  try { body = (await res.json()) as ApiEnvelope<T>; } catch {}

  if (!res.ok || !body || body.status !== "success" || body.data == null) {
    const message =
      body?.message ??
      body?.errors?.[0]?.message ??
      (res.status === 401 ? "Invalid credentials" : `Request failed (${res.status})`);
    return { data: null, error: { message } };
  }
  return { data: body.data, error: null };
}

export const authClient = {
  signIn: {
    email: async (args: { email: string; password: string }) => {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const { data, error } = await unwrap<LoginResponse>(res);
      if (error || !data) return { data: null, error };

      const session: Session = {
        token: data.token,
        user: {
          id: String(data.userId),
          email: data.email,
          name: data.fullName,
          role: data.role.toLowerCase(),
        },
      };
      persistSession(session);
      return { data: session, error: null };
    },
  },

  signUp: {
    email: async (args: { email: string; password: string; name: string; phone?: string }) => {
      const res = await fetch("/api/v1/auth/register/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: args.name,
          email: args.email,
          password: args.password,
          phone: args.phone ?? "",
        }),
      });
      return unwrap<{ userId: number; email: string }>(res);
    },
  },

  verifyOtp: async (args: { email: string; otp: string }) => {
    const res = await fetch("/api/v1/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return unwrap<void>(res);
  },

  signOut: async () => {
    clearSession();
    return { data: null, error: null };
  },

  getSession: (): Session | null => readSession(),

  useSession: () => {
    const session = typeof window !== "undefined" ? readSession() : null;
    return { data: session, isPending: false };
  },
};

export const ROLE_HOME: Record<string, string> = {
  candidate: "/candidate",
  recruiter: "/dashboard",
  admin: "/admin",
  super_admin: "/admin",
};
