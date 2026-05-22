"use client";

import { apiFetch } from "./api";

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

export const authClient = {
  signIn: {
    email: async (args: { email: string; password: string }) => {
      const { data, error } = await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(args),
      }, { auth: false, redirectOn401: false });
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
      return apiFetch<{ userId: number; email: string }>("/api/v1/auth/register/candidate", {
        method: "POST",
        body: JSON.stringify({
          fullName: args.name,
          email: args.email,
          password: args.password,
          phone: args.phone ?? "",
        }),
      }, { auth: false, redirectOn401: false });
    },
  },

  verifyOtp: async (args: { email: string; otp: string }) => {
    return apiFetch<void>("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(args),
    }, { auth: false, redirectOn401: false });
  },

  resendOtp: async (args: { email: string }) => {
    return apiFetch<void>("/api/v1/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(args),
    }, { auth: false, redirectOn401: false });
  },

  changePassword: async (args: { currentPassword: string; newPassword: string }) => {
    return apiFetch<void>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(args),
    });
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
