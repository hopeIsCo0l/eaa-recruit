"use client";

import { useEffect, useState } from "react";
import {
  FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Cell,
} from "recharts";

type FunnelItem = { name: string; value: number; fill: string };
type ActiveJob  = { id: string; title: string; dept: string; applied: number; screened: number; ttf: number };
type Kpis       = { activeCycles: number; totalApplicants: number; avgTtfDays: number };

// TTF weekly chart stays representative until we have historical week-over-week data
const TTF_DATA = [
  { week: "W1", days: 3 },
  { week: "W2", days: 5 },
  { week: "W3", days: 4 },
  { week: "W4", days: 6 },
  { week: "W5", days: 4 },
  { week: "W6", days: 3 },
];

const URGENT_ACTIONS = [
  { id: 1, type: "EXAM READY",  message: "Check candidate pipeline for exam-ready applicants", role: "ALL ROLES",        time: "live", priority: "medium" },
  { id: 2, type: "REVIEW",      message: "New applications submitted — review screened pool",  role: "ACTIVE POSTINGS", time: "live", priority: "low"    },
];

const TooltipStyle: React.CSSProperties = {
  background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 0,
  padding: "8px 12px", fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: "9px", color: "var(--c-text)", letterSpacing: "1px",
};

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[{index}]</span>
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

function KPICard({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div
      className="flex flex-col gap-3 p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]"
      style={accent ? { borderColor: "var(--c-accent)", background: "rgba(255,214,0,0.03)" } : {}}
    >
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</span>
      <span className="font-grotesk text-[33px] font-bold leading-none tracking-[-1px]"
        style={{ color: accent ? "var(--c-accent)" : "var(--c-text)" }}>
        {value}
      </span>
      <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px]">{sub}</span>
    </div>
  );
}

export default function RecruiterDashboard() {
  const [kpis, setKpis] = useState<Kpis>({ activeCycles: 0, totalApplicants: 0, avgTtfDays: 0 });
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([
    { name: "APPLIED",     value: 0, fill: "var(--c-accent)" },
    { name: "AI SCREENED", value: 0, fill: "var(--c-accent-hover)" },
    { name: "INTERVIEWED", value: 0, fill: "#B39900" },
    { name: "OFFERED",     value: 0, fill: "#805E00" },
  ]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/recruiter")
      .then((r) => r.json())
      .then((data) => {
        if (data.kpis)       setKpis(data.kpis);
        if (data.funnelData) setFunnelData(data.funnelData);
        if (data.activeJobs) setActiveJobs(data.activeJobs);
      })
      .finally(() => setLoading(false));
  }, []);

  const screenRate = funnelData[0]?.value > 0
    ? `${Math.round((funnelData[1]?.value / funnelData[0]?.value) * 100)}%` : "—";
  const examRate = funnelData[1]?.value > 0
    ? `${Math.round((funnelData[2]?.value / funnelData[1]?.value) * 100)}%` : "—";
  const hireRate = funnelData[2]?.value > 0
    ? `${Math.round((funnelData[3]?.value / funnelData[2]?.value) * 100)}%` : "—";

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[01] // PIPELINE OVERVIEW</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Recruitment Dashboard
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Live funnel metrics across all active roles — EAA Recruit
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--c-border-soft)] mb-8">
        <KPICard label="ACTIVE CYCLES"    value={loading ? "…" : String(kpis.activeCycles)}   sub="Open recruitment pipelines" accent />
        <KPICard label="TOTAL APPLICANTS" value={loading ? "…" : String(kpis.totalApplicants)} sub="Across all active postings" />
        <KPICard label="AVG. TIME-TO-FILL" value={loading ? "…" : `${kpis.avgTtfDays}d`}      sub="Days since job posted" />
        <KPICard label="FUNNEL STAGES"    value={loading ? "…" : String(funnelData.length)}    sub="Applied → Screened → Offered" />
      </div>

      {/* Funnel + TTF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Funnel */}
        <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <SectionLabel index="02">ACTIVE RECRUITMENT FUNNEL</SectionLabel>
          <ResponsiveContainer width="100%" height={240}>
            <FunnelChart>
              <Tooltip contentStyle={TooltipStyle} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive lastShapeType="rectangle">
                <LabelList position="right" fill="var(--c-text-sub)" stroke="none" dataKey="name"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 9, letterSpacing: "1px" }} />
                <LabelList position="center" fill="var(--c-text)" stroke="none" dataKey="value"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)", fontSize: 11, fontWeight: "bold", letterSpacing: "1px" }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
          <div className="flex gap-[1px] mt-4 bg-[var(--c-border-soft)]">
            {[
              { label: "SCREEN RATE", value: screenRate },
              { label: "EXAM RATE",   value: examRate },
              { label: "HIRE RATE",   value: hireRate },
            ].map((item) => (
              <div key={item.label} className="flex-1 flex flex-col items-center py-3 bg-[var(--c-bg-elev)] gap-1">
                <span className="font-grotesk text-[19px] font-bold text-[var(--c-accent)]">{item.value}</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time-to-Fill */}
        <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <SectionLabel index="03">TIME-TO-FILL (DAYS PER WEEK)</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TTF_DATA} barSize={28}>
              <XAxis dataKey="week"
                tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)", letterSpacing: "1px" }}
                axisLine={{ stroke: "var(--c-border-soft)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false} tickLine={false} width={24} unit="d" />
              <Tooltip contentStyle={TooltipStyle} cursor={{ fill: "rgba(255,214,0,0.04)" }} />
              <Bar dataKey="days" radius={0}>
                {TTF_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.days <= 4 ? "var(--c-accent)" : "var(--c-warn)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] bg-[var(--c-accent)]" />
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)]">ON TRACK (≤4d)</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px] bg-[var(--c-warn)]" />
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)]">DELAYED (&gt;4d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Actions + Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Actions */}
        <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <SectionLabel index="04">URGENT ACTIONS</SectionLabel>
          <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
            {URGENT_ACTIONS.map((action) => (
              <div key={action.id} className="flex items-start gap-4 p-4 bg-[var(--c-bg-elev)]">
                <div className="flex items-center justify-center px-2 py-[3px] shrink-0 mt-[1px]"
                  style={{
                    background: action.priority === "high" ? "rgba(255,107,53,0.12)" : action.priority === "medium" ? "rgba(255,214,0,0.08)" : "rgba(255,255,255,0.04)",
                    borderLeft: `2px solid ${action.priority === "high" ? "var(--c-warn)" : action.priority === "medium" ? "var(--c-accent)" : "var(--c-border)"}`,
                  }}>
                  <span className="font-ibm-mono text-[8px] tracking-[1px]"
                    style={{ color: action.priority === "high" ? "var(--c-warn)" : action.priority === "medium" ? "var(--c-accent)" : "var(--c-text-muted)" }}>
                    {action.type}
                  </span>
                </div>
                <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text)] leading-relaxed">{action.message}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-ibm-mono text-[8px] text-[var(--c-accent)]/70 tracking-[1px]">{action.role}</span>
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)]">//</span>
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{action.time}</span>
                  </div>
                </div>
                <button className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors shrink-0">
                  VIEW /
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active job postings */}
        <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <SectionLabel index="05">ACTIVE JOB CYCLES</SectionLabel>
          <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 bg-[var(--c-bg)] items-center">
              {["ROLE", "APPLIED", "SCREENED", "TTF"].map((h) => (
                <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
              ))}
            </div>
            {loading ? (
              <div className="px-4 py-6 bg-[var(--c-bg-elev)]">
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">LOADING...</span>
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="px-4 py-6 bg-[var(--c-bg-elev)]">
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">NO ACTIVE JOB POSTINGS YET</span>
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 bg-[var(--c-bg-elev)] items-center hover:bg-[var(--c-bg)] transition-colors">
                  <div className="flex flex-col gap-[2px] min-w-0">
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{job.title}</span>
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[0.5px]">{job.dept}</span>
                  </div>
                  <span className="font-grotesk text-[14px] font-bold text-[var(--c-text)]">{job.applied}</span>
                  <span className="font-grotesk text-[14px] font-bold text-[var(--c-accent)]">{job.screened}</span>
                  <span className="font-ibm-mono text-[10px]" style={{ color: job.ttf <= 7 ? "var(--c-accent)" : "var(--c-warn)" }}>
                    {job.ttf}d
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
              Showing {activeJobs.length} active posting{activeJobs.length !== 1 ? "s" : ""}
            </span>
            <a href="/dashboard/jobs" className="font-ibm-mono text-[9px] text-[var(--c-accent)] hover:underline tracking-[1px]">
              VIEW ALL /
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
