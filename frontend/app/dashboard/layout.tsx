"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "PIPELINE OVERVIEW",
    href: "/dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="0" y="0" width="6" height="6" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="0" width="6" height="6" stroke="currentColor" strokeWidth="1.2" />
        <rect x="0" y="8" width="6" height="6" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="8" width="6" height="6" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "MY JOB POSTINGS",
    href: "/dashboard/jobs",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="3" width="12" height="10" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 3V2a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 7h12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "CANDIDATE POOL",
    href: "/dashboard/candidates",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M0 12c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
        <path d="M10 8c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
      </svg>
    ),
  },
  {
    label: "PIPELINE (KANBAN)",
    href: "/dashboard/pipeline",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="0" y="0" width="3.5" height="14" rx="0" stroke="currentColor" strokeWidth="1.2" />
        <rect x="5" y="0" width="3.5" height="10" rx="0" stroke="currentColor" strokeWidth="1.2" />
        <rect x="10" y="0" width="3.5" height="6" rx="0" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "INTERVIEW SCHEDULER",
    href: "/dashboard/interviews",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="2" width="12" height="11" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 6h12M5 0v4M9 0v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
      </svg>
    ),
  },
  {
    label: "REPORTS & ANALYTICS",
    href: "/dashboard/reports",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 13V8l3-3 3 3 3-5 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-[var(--c-bg)] font-grotesk">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col bg-[var(--c-bg-elev)] border-r border-[var(--c-border-soft)]
          transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:h-screen md:sticky md:top-0
          ${collapsed ? "md:w-[60px]" : "md:w-[220px]"}
          w-[220px]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-[var(--c-border-soft)] shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-[8px]">
              <div className="flex items-center justify-center w-[28px] h-[28px] bg-[var(--c-accent)] shrink-0">
                <span className="font-ibm-mono text-[9px] font-bold text-[var(--c-text)] tracking-[1px]">EAA</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px]">RECRUITER</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)] tracking-[1px]">PORTAL</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex items-center justify-center w-[28px] h-[28px] bg-[var(--c-accent)] mx-auto">
              <span className="font-ibm-mono text-[8px] font-bold text-[var(--c-text)]">E</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex items-center justify-center w-[22px] h-[22px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              {collapsed ? (
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
              ) : (
                <path d="M10 6H2M6 2L2 6l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
              )}
            </svg>
          </button>
        </div>

        {/* Status pill */}
        {!collapsed && (
          <div className="px-4 pt-4">
            <div className="flex items-center gap-[6px] px-3 py-[6px] bg-[var(--c-accent)]/05 border border-[var(--c-accent)]/15">
              <div className="w-[5px] h-[5px] rounded-full bg-[var(--c-accent)] animate-pulse shrink-0" />
              <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px]">3 URGENT ACTIONS</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-[2px] px-2 pt-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-[10px] px-3 py-[10px] transition-all duration-150 group relative
                  ${isActive
                    ? "bg-[var(--c-accent)]/08 text-[var(--c-accent)]"
                    : "text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-bg-muted)]"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--c-accent)]" />
                )}
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="font-ibm-mono text-[10px] tracking-[1.5px] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-4 border-t border-[var(--c-border-soft)] pt-4 shrink-0">
          {!collapsed && (
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[26px] h-[26px] bg-[var(--c-bg-muted)] border border-[var(--c-border)] flex items-center justify-center shrink-0">
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)]">RC</span>
                </div>
                <div className="flex flex-col leading-none min-w-0">
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text)] tracking-[1px] truncate">RECRUITER</span>
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[0.5px]">recruit@eaa.et</span>
                </div>
              </div>
              <Link
                href="/"
                className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors mt-1"
              >
                BACK TO SITE /
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between h-[60px] px-6 border-b border-[var(--c-border-soft)] shrink-0 bg-[var(--c-bg-elev)] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              </svg>
            </button>
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[1.5px]">
              EAA RECRUIT / RECRUITER PORTAL
            </span>
          </div>
          <div className="flex items-center gap-[20px]">
            <div className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </div>
            <div className="w-[1px] h-[16px] bg-[var(--c-border-soft)]" />
            <div className="relative">
              <div className="flex items-center gap-[6px] cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--c-text-muted)]">
                  <path d="M7 1a4 4 0 0 1 4 4c0 3-4 8-4 8S3 8 3 5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="7" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1px]">ADDIS ABABA</span>
              </div>
            </div>
            <div className="w-[1px] h-[16px] bg-[var(--c-border-soft)]" />
            <div className="flex items-center gap-[6px]">
              <div className="w-[5px] h-[5px] rounded-full bg-[var(--c-accent)]" />
              <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px]">LIVE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
