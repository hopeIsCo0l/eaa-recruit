"use client";

import { useState } from "react";

type Role = "ADMIN" | "RECRUITER" | "CANDIDATE";
type Status = "ACTIVE" | "SUSPENDED";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
}

const MOCK_USERS: User[] = [
  { id: "U001", name: "Amanuel Tesfaye",  email: "a.tesfaye@eaa.et",   role: "ADMIN",     status: "ACTIVE",    lastLogin: "2026-04-25 14:32" },
  { id: "U002", name: "Hana Girma",       email: "h.girma@eaa.et",     role: "RECRUITER", status: "ACTIVE",    lastLogin: "2026-04-25 09:11" },
  { id: "U003", name: "Dawit Mulugeta",   email: "d.mulugeta@eaa.et",  role: "RECRUITER", status: "ACTIVE",    lastLogin: "2026-04-24 16:47" },
  { id: "U004", name: "Selam Bekele",     email: "s.bekele@eaa.et",    role: "RECRUITER", status: "SUSPENDED", lastLogin: "2026-04-10 08:02" },
  { id: "U005", name: "Yonas Haile",      email: "y.haile@gmail.com",  role: "CANDIDATE", status: "ACTIVE",    lastLogin: "2026-04-25 11:55" },
  { id: "U006", name: "Meron Alemu",      email: "m.alemu@gmail.com",  role: "CANDIDATE", status: "ACTIVE",    lastLogin: "2026-04-25 13:20" },
  { id: "U007", name: "Bereket Tadesse",  email: "b.tadesse@gmail.com",role: "CANDIDATE", status: "ACTIVE",    lastLogin: "2026-04-23 07:39" },
  { id: "U008", name: "Tigist Woldeyohannes", email: "t.wolde@gmail.com", role: "CANDIDATE", status: "SUSPENDED", lastLogin: "2026-03-30 10:00" },
];

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  ADMIN:     { bg: "rgba(255,214,0,0.1)",   text: "var(--c-accent)" },
  RECRUITER: { bg: "rgba(255,107,53,0.1)",  text: "var(--c-warn)" },
  CANDIDATE: { bg: "rgba(245,245,240,0.06)", text: "var(--c-text-sub)" },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-[480px] mx-4 bg-[var(--c-bg-elev)] border border-[var(--c-border)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border-soft)]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[14px] bg-[var(--c-accent)]" />
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">ADD INTERNAL USER</span>
          </div>
          <button onClick={onClose} className="text-[var(--c-text-dim)] hover:text-[var(--c-text)] transition-colors font-ibm-mono text-[17px]">
            ×
          </button>
        </div>
        <form className="flex flex-col gap-5 px-6 py-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          {[
            { label: "FULL NAME", placeholder: "e.g. Amanuel Tesfaye", type: "text" },
            { label: "EMAIL ADDRESS", placeholder: "name@eaa.et", type: "email" },
            { label: "TEMPORARY PASSWORD", placeholder: "Min. 12 characters", type: "password" },
          ].map(({ label, placeholder, type }) => (
            <div key={label} className="flex flex-col gap-[6px]">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                className="w-full h-[40px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
              />
            </div>
          ))}
          <div className="flex flex-col gap-[6px]">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">ASSIGN ROLE</label>
            <select className="w-full h-[40px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[12px] text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)] transition-colors appearance-none">
              <option value="RECRUITER">RECRUITER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 h-[40px] bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors"
            >
              CREATE ACCOUNT
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] px-5 border border-[var(--c-border)] font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1.5px] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] transition-colors"
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
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const counts = {
    ADMIN:     users.filter((u) => u.role === "ADMIN").length,
    RECRUITER: users.filter((u) => u.role === "RECRUITER").length,
    CANDIDATE: users.filter((u) => u.role === "CANDIDATE").length,
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : u)
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {showModal && <AddUserModal onClose={() => setShowModal(false)} />}

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
          + ADD USER
        </button>
      </div>

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
            {filtered.map((user, i) => (
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
                  <div className="flex items-center gap-[8px]">
                    <button
                      className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors"
                    >
                      RESET PWD
                    </button>
                    <span className="text-[var(--c-border-soft)]">|</span>
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className="font-ibm-mono text-[9px] tracking-[1px] transition-colors"
                      style={{ color: user.status === "ACTIVE" ? "var(--c-warn)" : "var(--c-accent)" }}
                    >
                      {user.status === "ACTIVE" ? "SUSPEND" : "ACTIVATE"}
                    </button>
                    {user.role !== "ADMIN" && (
                      <>
                        <span className="text-[var(--c-border-soft)]">|</span>
                        <button className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] tracking-[1px] transition-colors">
                          PROMOTE
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <span className="font-ibm-mono text-[11px] text-[var(--c-text-faint)] tracking-[1.5px]">NO USERS MATCH THIS FILTER</span>
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
