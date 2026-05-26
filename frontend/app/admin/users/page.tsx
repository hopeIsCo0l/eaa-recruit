"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Role = "ADMIN" | "RECRUITER" | "CANDIDATE" | "SUPER_ADMIN";
type Status = "ACTIVE" | "SUSPENDED";

interface User {
  id: string;
  numericId: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
}

type BackendUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt?: string | null;
};

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  ADMIN:       { bg: "rgba(255,214,0,0.1)",    text: "var(--c-accent)" },
  SUPER_ADMIN: { bg: "rgba(255,214,0,0.15)",   text: "var(--c-accent)" },
  RECRUITER:   { bg: "rgba(255,107,53,0.1)",   text: "var(--c-warn)" },
  CANDIDATE:   { bg: "rgba(245,245,240,0.06)", text: "var(--c-text-sub)" },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

/**
 * Create-recruiter modal. Hits POST /api/v1/admin/users/recruiter.
 *
 * Backend (CreateRecruiterRequest) requires fullName(2-100), email, and
 * temporaryPassword(8-72). Backend only exposes recruiter creation today —
 * ADMIN accounts are seeded, no API to create them via UI.
 */
function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) { setError("FULL NAME MUST BE AT LEAST 2 CHARACTERS"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("EMAIL FORMAT INVALID"); return; }
    if (password.length < 8) { setError("PASSWORD MUST BE AT LEAST 8 CHARACTERS"); return; }

    setSubmitting(true);
    const { error: apiError } = await apiFetch<{ userId: number; email: string }>(
      "/api/v1/admin/users/recruiter",
      {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          temporaryPassword: password,
        }),
      },
    );
    setSubmitting(false);

    if (apiError) {
      setError(apiError.message.toUpperCase());
      return;
    }
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-[480px] mx-4 bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border-soft)]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[14px] bg-[var(--c-accent)]" />
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">ADD RECRUITER</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-[var(--c-text-dim)] hover:text-[var(--c-text)] transition-colors font-ibm-mono text-[17px] disabled:opacity-40"
          >
            ×
          </button>
        </div>
        <form className="flex flex-col gap-5 px-6 py-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[6px]">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">FULL NAME</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amanuel Tesfaye"
              className="w-full h-[40px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@eaa.et"
              className="w-full h-[40px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">TEMPORARY PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full h-[40px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">ASSIGN ROLE</label>
            <div className="h-[40px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 flex items-center font-ibm-mono text-[12px] text-[var(--c-text-muted)]">
              RECRUITER&nbsp;<span className="text-[var(--c-text-faint)]">// only role supported by API today</span>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/5">
              <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-[40px] bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "CREATING…" : "CREATE ACCOUNT"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-[40px] px-5 border border-[var(--c-border)] font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1.5px] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] transition-colors disabled:opacity-40"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiFetch<BackendUser[]>("/api/v1/admin/users");
    setLoading(false);
    if (error || !data) return;
    setUsers(data.map((u) => ({
      id: String(u.id),
      numericId: u.id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.active ? "ACTIVE" : "SUSPENDED",
      lastLogin: u.lastLoginAt ?? "—",
    })));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const counts: Record<Role, number> = {
    ADMIN:       users.filter((u) => u.role === "ADMIN").length + users.filter((u) => u.role === "SUPER_ADMIN").length,
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
    RECRUITER:   users.filter((u) => u.role === "RECRUITER").length,
    CANDIDATE:   users.filter((u) => u.role === "CANDIDATE").length,
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // Optimistic status toggle backed by PATCH /admin/users/{id}/status.
  // Backend enforces guards (self-deactivation, last-super-admin) and returns
  // a BusinessException message — surface it and roll back on failure.
  async function toggleStatus(u: User) {
    setActionError(null);
    const next = u.status === "ACTIVE" ? false : true;
    // Optimistic update
    setUsers((prev) =>
      prev.map((x) => x.id === u.id ? { ...x, status: next ? "ACTIVE" : "SUSPENDED" } : x)
    );
    const { error } = await apiFetch<void>(
      `/api/v1/admin/users/${u.numericId}/status`,
      { method: "PATCH", body: JSON.stringify({ active: next }) },
    );
    if (error) {
      // Roll back
      setUsers((prev) =>
        prev.map((x) => x.id === u.id ? { ...x, status: u.status } : x)
      );
      setActionError(`${u.email}: ${error.message}`);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onCreated={loadUsers}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[02] // USER MANAGEMENT</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Identity &amp; Access
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-[8px] h-[40px] px-5 bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors self-start"
        >
          + ADD RECRUITER
        </button>
      </div>

      {actionError && (
        <div className="mb-5 px-4 py-3 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/5 flex items-center justify-between">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] tracking-[1px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Counters */}
      <div className="grid grid-cols-3 gap-[1px] bg-[var(--c-border-soft)] mb-8">
        {(["ADMIN", "RECRUITER", "CANDIDATE"] as Role[]).map((role) => (
          <div key={role} className="flex flex-col gap-2 p-5 bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[9px] tracking-[1.5px]" style={{ color: ROLE_COLORS[role].text }}>
              {role}S
            </span>
            <span className="font-grotesk text-[33px] font-bold text-[var(--c-text)] leading-none">{counts[role]}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="SEARCH BY NAME OR EMAIL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-[38px] bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] px-4 font-ibm-mono text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
        />
        <div className="flex gap-[2px]">
          {(["ALL", "ADMIN", "RECRUITER", "CANDIDATE"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="h-[38px] px-4 font-ibm-mono text-[9px] tracking-[1.5px] transition-colors"
              style={{
                background: roleFilter === r ? "var(--c-accent)" : "var(--c-bg-elev)",
                color:      roleFilter === r ? "var(--c-text)" : "var(--c-text-muted)",
                border:     "1px solid var(--c-border-soft)",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[var(--c-border-soft)] overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--c-border-soft)]">
              {["ID", "NAME", "EMAIL", "ROLE", "STATUS", "LAST LOGIN", "ACTIONS"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--c-bg-muted)] hover:bg-[var(--c-bg)] transition-colors"
              >
                <td className="px-4 py-3 font-ibm-mono text-[9px] text-[var(--c-text-dim)]">{user.id}</td>
                <td className="px-4 py-3 font-grotesk text-[14px] text-[var(--c-text)]">{user.name}</td>
                <td className="px-4 py-3 font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className="font-ibm-mono text-[9px] px-2 py-[3px] tracking-[1px]"
                    style={{ background: ROLE_COLORS[user.role].bg, color: ROLE_COLORS[user.role].text }}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-[6px]">
                    <div
                      className="w-[5px] h-[5px] rounded-full shrink-0"
                      style={{ background: user.status === "ACTIVE" ? "var(--c-accent)" : "var(--c-warn)" }}
                    />
                    <span
                      className="font-ibm-mono text-[9px] tracking-[1px]"
                      style={{ color: user.status === "ACTIVE" ? "var(--c-accent)" : "var(--c-warn)" }}
                    >
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-ibm-mono text-[9px] text-[var(--c-text-dim)]">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(user)}
                    className="font-ibm-mono text-[9px] tracking-[1px] transition-colors hover:opacity-70"
                    style={{ color: user.status === "ACTIVE" ? "var(--c-warn)" : "var(--c-accent)" }}
                  >
                    {user.status === "ACTIVE" ? "SUSPEND" : "ACTIVATE"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <span className="font-ibm-mono text-[11px] text-[var(--c-text-faint)] tracking-[1.5px]">
              {loading ? "LOADING…" : "NO USERS MATCH THIS FILTER"}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">
          SHOWING {filtered.length} OF {users.length} USERS
        </span>
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">PAGE 1 / 1</span>
      </div>
    </div>
  );
}
