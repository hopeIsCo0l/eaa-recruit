"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, type Session } from "@/lib/auth-client";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SidebarUserPill({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(authClient.getSession());
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-[6px]">
        <div className="w-[26px] h-[26px] bg-[var(--c-bg-muted)] border border-[var(--c-border)] flex items-center justify-center">
          <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)]">
            {session ? initials(session.user.name) : "??"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="text-[var(--c-text-dim)] hover:text-[var(--c-accent)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 1H2v12h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
            <path d="M6 7h7M10 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[8px]">
        <div className="w-[26px] h-[26px] bg-[var(--c-bg-muted)] border border-[var(--c-border)] flex items-center justify-center shrink-0">
          <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)]">
            {session ? initials(session.user.name) : "??"}
          </span>
        </div>
        <div className="flex flex-col leading-none min-w-0">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text)] tracking-[1px] truncate">
            {session?.user.name?.toUpperCase() ?? "—"}
          </span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[0.5px] truncate">
            {session?.user.email ?? "not signed in"}
          </span>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors text-left"
      >
        SIGN OUT /
      </button>
    </div>
  );
}
