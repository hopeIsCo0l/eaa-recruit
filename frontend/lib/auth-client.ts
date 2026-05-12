"use client";

// Stage-1 stub. Replaced in stage 2 with a thin JWT client for Spring backend.
// Returns the same shape as better-auth so existing pages compile.

type Result<T> = Promise<{ data: T | null; error: { message: string } | null }>;

export const authClient = {
  signIn: {
    email: async (_args: { email: string; password: string }): Result<{ user: { role: string } }> => ({
      data: null,
      error: { message: "Auth not wired yet (stage 2)" },
    }),
  },
  signUp: {
    email: async (_args: { email: string; password: string; name: string }): Result<unknown> => ({
      data: null,
      error: { message: "Auth not wired yet (stage 2)" },
    }),
  },
  signOut: async () => ({ data: null, error: null }),
  useSession: () => ({ data: null, isPending: false }),
};

export type ClientSession = { user: { id: string; email: string; role: string } } | null;
