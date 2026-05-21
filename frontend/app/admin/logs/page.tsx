"use client";

import { useState } from "react";

type Severity = "INFO" | "WARN" | "ERROR" | "CRITICAL";
type Category = "AUTH" | "DATA" | "SYSTEM" | "API";

interface LogEntry {
  id: string;
  timestamp: string;
  actor: string;
  category: Category;
  severity: Severity;
  action: string;
  ip: string;
  detail: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: "L0089", timestamp: "2026-04-25 14:32:11", actor: "a.tesfaye@eaa.et", category: "AUTH",   severity: "INFO",     action: "ADMIN_LOGIN",           ip: "197.156.72.10",  detail: "Successful login via 2FA" },
  { id: "L0088", timestamp: "2026-04-25 14:28:44", actor: "system",           category: "SYSTEM", severity: "INFO",     action: "CV_PARSE_BATCH",        ip: "localhost",      detail: "Batch of 12 CVs processed — 12 success, 0 failed" },
  { id: "L0087", timestamp: "2026-04-25 13:47:03", actor: "h.girma@eaa.et",  category: "DATA",   severity: "WARN",     action: "EXPORT_CANDIDATE_LIST", ip: "197.156.72.14",  detail: "Recruiter exported 89 candidate records (xlsx)" },
  { id: "L0086", timestamp: "2026-04-25 12:10:59", actor: "unknown",          category: "AUTH",   severity: "CRITICAL", action: "FAILED_LOGIN_×5",       ip: "41.66.2.101",    detail: "5 consecutive failed attempts — account locked" },
  { id: "L0085", timestamp: "2026-04-25 11:55:20", actor: "y.haile@gmail.com",category: "API",   severity: "INFO",     action: "CV_UPLOAD",             ip: "197.156.90.4",   detail: "CV submitted — PDF 342KB — parse queued" },
  { id: "L0084", timestamp: "2026-04-25 11:02:35", actor: "d.mulugeta@eaa.et",category: "DATA",  severity: "INFO",     action: "SHORTLIST_UPDATED",     ip: "197.156.72.18",  detail: "Candidate U127 moved to shortlist for role R03" },
  { id: "L0083", timestamp: "2026-04-25 09:30:00", actor: "system",           category: "SYSTEM", severity: "WARN",    action: "HIGH_CPU_ALERT",        ip: "localhost",      detail: "CPU usage peaked at 87% for 3 minutes" },
  { id: "L0082", timestamp: "2026-04-25 08:15:48", actor: "a.tesfaye@eaa.et", category: "DATA",  severity: "INFO",    action: "CONFIG_UPDATED",        ip: "197.156.72.10",  detail: "Shortlist cutoff updated from 65% to 70%" },
  { id: "L0081", timestamp: "2026-04-24 18:00:01", actor: "system",           category: "SYSTEM", severity: "INFO",   action: "NIGHTLY_BACKUP",        ip: "localhost",      detail: "pgvector snapshot completed — 1.2GB compressed" },
  { id: "L0080", timestamp: "2026-04-24 16:47:22", actor: "d.mulugeta@eaa.et",category: "AUTH",  severity: "INFO",   action: "RECRUITER_LOGIN",       ip: "197.156.72.18",  detail: "Successful login" },
  { id: "L0079", timestamp: "2026-04-24 14:11:09", actor: "system",           category: "API",   severity: "ERROR",  action: "SMS_GATEWAY_FAIL",      ip: "localhost",      detail: "Ethiotelecom SMS API returned 503 — 3 retries exhausted" },
  { id: "L0078", timestamp: "2026-04-24 09:00:00", actor: "system",           category: "SYSTEM", severity: "INFO",  action: "VECTOR_INDEX_REBUILD",  ip: "localhost",      detail: "pgvector HNSW index rebuilt — 1,284 vectors indexed" },
];

const SEV_STYLES: Record<Severity, { bg: string; text: string; border: string }> = {
  INFO:     { bg: "rgba(245,245,240,0.04)", text: "var(--c-text-muted)",    border: "var(--c-border)" },
  WARN:     { bg: "rgba(255,107,53,0.08)",  text: "var(--c-warn)", border: "var(--c-warn)" },
  ERROR:    { bg: "rgba(255,80,80,0.08)",   text: "#FF5050", border: "#FF5050" },
  CRITICAL: { bg: "rgba(255,0,0,0.12)",     text: "#FF2020", border: "#FF2020" },
};

const CAT_COLORS: Record<Category, string> = {
  AUTH:   "var(--c-accent)",
  DATA:   "var(--c-warn)",
  SYSTEM: "var(--c-text-sub)",
  API:    "var(--c-text-muted)",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

export default function LogsPage() {
  const [sevFilter, setSevFilter]   = useState<Severity | "ALL">("ALL");
  const [catFilter, setCatFilter]   = useState<Category | "ALL">("ALL");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState<string | null>(null);

  const filtered = MOCK_LOGS.filter((l) => {
    const matchSev = sevFilter === "ALL" || l.severity === sevFilter;
    const matchCat = catFilter === "ALL" || l.category === catFilter;
    const matchQ   = search === "" ||
      l.action.includes(search.toUpperCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchCat && matchQ;
  });

  const criticalCount = MOCK_LOGS.filter((l) => l.severity === "CRITICAL").length;
  const errorCount    = MOCK_LOGS.filter((l) => l.severity === "ERROR").length;
  const warnCount     = MOCK_LOGS.filter((l) => l.severity === "WARN").length;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[04] // SECURITY LOGS</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Audit Trail
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Immutable system log — Data Protection Proclamation No. 1321/2024 compliance
        </p>
      </div>

      {/* Alert counters */}
      <div className="grid grid-cols-3 gap-[1px] bg-[var(--c-border-soft)] mb-8">
        {[
          { label: "CRITICAL EVENTS", count: criticalCount, color: "#FF2020" },
          { label: "ERRORS",          count: errorCount,    color: "#FF5050" },
          { label: "WARNINGS",        count: warnCount,     color: "var(--c-warn)" },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex flex-col gap-2 p-5 bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[9px] tracking-[1.5px]" style={{ color }}>{label}</span>
            <span className="font-grotesk text-[37px] font-bold leading-none" style={{ color: count > 0 ? color : "var(--c-border)" }}>
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <input
          type="text"
          placeholder="SEARCH LOGS — ACTION, ACTOR, DETAIL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-[38px] bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] px-4 font-ibm-mono text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-[2px]">
            {(["ALL", "INFO", "WARN", "ERROR", "CRITICAL"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSevFilter(s)}
                className="h-[30px] px-3 font-ibm-mono text-[9px] tracking-[1.5px] transition-colors border border-[var(--c-border-soft)]"
                style={{
                  background: sevFilter === s ? (s === "ALL" ? "var(--c-accent)" : SEV_STYLES[s as Severity]?.bg ?? "var(--c-accent)") : "var(--c-bg-elev)",
                  color:      sevFilter === s ? (s === "ALL" ? "var(--c-text)" : SEV_STYLES[s as Severity]?.text ?? "var(--c-text)") : "var(--c-text-dim)",
                  borderColor: sevFilter === s && s !== "ALL" ? SEV_STYLES[s as Severity]?.border : "var(--c-border-soft)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="w-[1px] bg-[var(--c-border-soft)] self-stretch" />
          <div className="flex gap-[2px]">
            {(["ALL", "AUTH", "DATA", "SYSTEM", "API"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className="h-[30px] px-3 font-ibm-mono text-[9px] tracking-[1.5px] transition-colors border"
                style={{
                  background:  catFilter === c ? (c === "ALL" ? "var(--c-accent)" : "rgba(255,255,255,0.04)") : "var(--c-bg-elev)",
                  color:       catFilter === c ? (c === "ALL" ? "var(--c-text)" : CAT_COLORS[c as Category]) : "var(--c-text-dim)",
                  borderColor: catFilter === c && c !== "ALL" ? CAT_COLORS[c as Category] : "var(--c-border-soft)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log entries */}
      <SectionLabel>{`LOG ENTRIES — ${filtered.length} RECORDS`}</SectionLabel>
      <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
        {filtered.map((log) => {
          const sev   = SEV_STYLES[log.severity];
          const isExp = expanded === log.id;
          return (
            <div
              key={log.id}
              className="bg-[var(--c-bg-elev)] cursor-pointer"
              onClick={() => setExpanded(isExp ? null : log.id)}
            >
              <div className="flex items-center gap-0 min-w-0 overflow-x-auto">
                {/* Severity accent */}
                <div className="w-[3px] self-stretch shrink-0" style={{ background: sev.border === "var(--c-border)" ? "transparent" : sev.border }} />

                <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0 flex-wrap md:flex-nowrap">
                  {/* Timestamp */}
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] shrink-0 w-[128px]">{log.timestamp}</span>

                  {/* Severity badge */}
                  <span
                    className="font-ibm-mono text-[8px] px-[6px] py-[2px] tracking-[1px] shrink-0 border"
                    style={{ background: sev.bg, color: sev.text, borderColor: sev.border }}
                  >
                    {log.severity}
                  </span>

                  {/* Category */}
                  <span
                    className="font-ibm-mono text-[9px] tracking-[1.5px] shrink-0 w-[52px]"
                    style={{ color: CAT_COLORS[log.category] }}
                  >
                    {log.category}
                  </span>

                  {/* Action */}
                  <span className="font-ibm-mono text-[11px] text-[var(--c-text)] tracking-[0.5px] shrink-0 min-w-[160px]">
                    {log.action}
                  </span>

                  {/* Actor */}
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] flex-1 truncate min-w-[120px]">{log.actor}</span>

                  {/* IP */}
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] shrink-0 w-[112px] text-right">{log.ip}</span>

                  {/* Expand chevron */}
                  <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="none"
                    className="shrink-0 text-[var(--c-text-faint)] transition-transform"
                    style={{ transform: isExp ? "rotate(180deg)" : "none" }}
                  >
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                  </svg>
                </div>
              </div>

              {/* Expanded detail */}
              {isExp && (
                <div className="px-6 py-3 border-t border-[var(--c-bg-muted)] bg-[var(--c-bg)] flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] w-[80px] shrink-0">LOG ID</span>
                    <span className="font-ibm-mono text-[10px] text-[var(--c-accent)]">{log.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] w-[80px] shrink-0">DETAIL</span>
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] leading-relaxed">{log.detail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] w-[80px] shrink-0">SOURCE IP</span>
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{log.ip}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16 bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[11px] text-[var(--c-text-faint)] tracking-[1.5px]">NO LOGS MATCH THIS FILTER</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">
          SHOWING {filtered.length} OF {MOCK_LOGS.length} ENTRIES — LAST 24H
        </span>
        <button className="font-ibm-mono text-[9px] text-[var(--c-accent)] hover:text-[var(--c-accent-hover)] tracking-[1px] transition-colors">
          EXPORT CSV /
        </button>
      </div>
    </div>
  );
}
