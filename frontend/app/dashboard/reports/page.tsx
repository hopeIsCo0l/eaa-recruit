"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BackendApp {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateName: string;
  status: string;
  cvRelevanceScore: number | null;
  examScore: number | null;
  finalScore: number | null;
}

interface RoleRow {
  job: string;
  applied: number;
  screened: number;
  shortlisted: number;
  selected: number;
  rejected: number;
}

const TooltipStyle: React.CSSProperties = {
  background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 0,
  padding: "8px 12px", fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: "9px", color: "var(--c-text)", letterSpacing: "1px",
};

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  return "var(--c-text-sub)";
}

function statusLabel(s: string) {
  return s.replace(/_/g, " ");
}

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[{index}]</span>
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [apps, setApps] = useState<BackendApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState(false);

  const load = useCallback(async () => {
    const { data } = await apiFetch<BackendApp[]>("/api/v1/recruiters/applications");
    if (data) setApps(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Compute per-job breakdown
  const jobMap = new Map<string, RoleRow>();
  for (const a of apps) {
    let row = jobMap.get(a.jobTitle);
    if (!row) {
      row = { job: a.jobTitle, applied: 0, screened: 0, shortlisted: 0, selected: 0, rejected: 0 };
      jobMap.set(a.jobTitle, row);
    }
    row.applied++;
    if (["EXAM_AUTHORIZED", "EXAM_COMPLETED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "REJECTED", "WAITLISTED"].includes(a.status)) {
      row.screened++;
    }
    if (["SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED"].includes(a.status)) {
      row.shortlisted++;
    }
    if (a.status === "SELECTED") row.selected++;
    if (a.status === "REJECTED" || a.status === "HARD_FILTER_FAILED") row.rejected++;
  }
  const roleBreakdown = Array.from(jobMap.values());

  // Top candidates (sorted by finalScore desc)
  const topCandidates = [...apps]
    .filter((a) => (a.finalScore ?? 0) > 0)
    .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
    .slice(0, 10);

  // Summary KPIs
  const totalApps = apps.length;
  const avgCv = apps.filter(a => a.cvRelevanceScore).reduce((s, a) => s + (a.cvRelevanceScore ?? 0), 0)
    / (apps.filter(a => a.cvRelevanceScore).length || 1);
  const avgExam = apps.filter(a => a.examScore).reduce((s, a) => s + (a.examScore ?? 0), 0)
    / (apps.filter(a => a.examScore).length || 1);
  const selectedCount = apps.filter(a => a.status === "SELECTED").length;

  function handleExport() {
    // Generate CSV from data
    const header = "ID,Candidate,Job,Status,CV Score,Exam Score,Final Score\n";
    const rows = apps.map(a =>
      `${a.id},"${a.candidateName}","${a.jobTitle}",${a.status},${a.cvRelevanceScore ?? ""},${a.examScore ?? ""},${a.finalScore ?? ""}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recruiter-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[06] // REPORTS & ANALYTICS</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Reports & Analytics
          </h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Real data from your job postings — exportable CSV
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={loading || apps.length === 0}
          className="flex items-center gap-2 px-4 py-3 border border-[var(--c-accent)] hover:bg-[var(--c-accent)]/08 transition-colors disabled:opacity-30"
        >
          <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[1.5px]">
            {exported ? "EXPORTED /" : "EXPORT CSV /"}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">LOADING...</div>
      ) : apps.length === 0 ? (
        <div className="py-12 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">NO DATA YET — CREATE JOBS AND RECEIVE APPLICATIONS</div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--c-border-soft)] mb-8">
            {[
              { label: "TOTAL APPLICATIONS", value: String(totalApps), color: "var(--c-text)" },
              { label: "AVG CV SCORE", value: `${Math.round(avgCv)}%`, color: "var(--c-accent)" },
              { label: "AVG EXAM SCORE", value: `${Math.round(avgExam)}%`, color: "var(--c-accent-hover)" },
              { label: "SELECTED", value: String(selectedCount), color: "var(--c-accent)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-2 p-5 bg-[var(--c-bg-elev)]">
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</span>
                <span className="font-grotesk text-[33px] font-bold leading-none" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Top candidates table */}
          {topCandidates.length > 0 && (
            <div className="mb-8">
              <SectionLabel index="A">TOP CANDIDATES BY FINAL SCORE</SectionLabel>
              <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
                  {["NAME / JOB", "FINAL %", "CV SCORE", "EXAM SCORE", "STATUS"].map((h) => (
                    <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
                  ))}
                </div>
                {topCandidates.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors">
                    <div className="flex flex-col gap-[2px]">
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{c.candidateName}</span>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{c.jobTitle}</span>
                    </div>
                    <span className="font-grotesk text-[16px] font-bold" style={{ color: matchColor(c.finalScore ?? 0) }}>
                      {Math.round(c.finalScore ?? 0)}%
                    </span>
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">
                      {c.cvRelevanceScore ? `${Math.round(c.cvRelevanceScore)}%` : "—"}
                    </span>
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">
                      {c.examScore ? `${Math.round(c.examScore)}%` : "—"}
                    </span>
                    <span className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px]"
                      style={{ color: c.status === "SELECTED" ? "var(--c-accent)" : c.status === "REJECTED" ? "var(--c-warn)" : "var(--c-text-sub)" }}>
                      {statusLabel(c.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-job breakdown */}
          <div className="mb-8">
            <SectionLabel index="B">PER-JOB FUNNEL BREAKDOWN</SectionLabel>
            <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
                {["JOB", "APPLIED", "SCREENED", "SHORTLISTED", "SCREEN RATE", "SELECT RATE"].map((h) => (
                  <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
                ))}
              </div>
              {roleBreakdown.map((r) => {
                const screenRate = r.applied > 0 ? Math.round((r.screened / r.applied) * 100) : 0;
                const selectRate = r.screened > 0 ? Math.round((r.selected / r.screened) * 100) : 0;
                return (
                  <div key={r.job} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors">
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{r.job}</span>
                    <span className="font-grotesk text-[14px] font-bold text-[var(--c-text)]">{r.applied}</span>
                    <span className="font-grotesk text-[14px] font-bold text-[var(--c-text-sub)]">{r.screened}</span>
                    <span className="font-grotesk text-[14px] font-bold text-[var(--c-accent)]">{r.shortlisted}</span>
                    <span className="font-ibm-mono text-[10px]" style={{ color: screenRate >= 20 ? "var(--c-accent)" : "var(--c-text-sub)" }}>{screenRate}%</span>
                    <span className="font-ibm-mono text-[10px]" style={{ color: selectRate >= 20 ? "var(--c-accent)" : "var(--c-text-sub)" }}>{selectRate}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bar chart */}
          {roleBreakdown.length > 0 && (
            <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
              <SectionLabel index="C">PIPELINE VOLUME BY JOB</SectionLabel>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={roleBreakdown} barGap={2} barSize={14}>
                  <XAxis
                    dataKey="job"
                    tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)", letterSpacing: "1px" }}
                    axisLine={{ stroke: "var(--c-border-soft)" }} tickLine={false}
                  />
                  <YAxis tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={TooltipStyle} cursor={{ fill: "rgba(255,214,0,0.04)" }} />
                  <Bar dataKey="applied" fill="var(--c-border)" name="Applied">
                    {roleBreakdown.map((_, i) => <Cell key={i} fill="var(--c-border)" />)}
                  </Bar>
                  <Bar dataKey="screened" fill="var(--c-text-sub)" name="Screened" />
                  <Bar dataKey="shortlisted" fill="var(--c-accent)" name="Shortlisted" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { label: "APPLIED", color: "var(--c-border)" },
                  { label: "SCREENED", color: "var(--c-text-sub)" },
                  { label: "SHORTLISTED", color: "var(--c-accent)" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-[6px]">
                    <div className="w-[8px] h-[8px]" style={{ background: l.color }} />
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
