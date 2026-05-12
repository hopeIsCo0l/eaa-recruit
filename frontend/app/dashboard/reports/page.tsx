"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell,
} from "recharts";

const shortlistData = [
  { name: "Amanuel Tadesse",  role: "Senior Pilot",    match: 94, cvScore: 96, examScore: 91, stage: "INTERVIEWED" },
  { name: "Hana Girma",       role: "Senior Pilot",    match: 91, cvScore: 89, examScore: 94, stage: "INTERVIEWED" },
  { name: "Eden Tadesse",     role: "Flight Engineer", match: 74, cvScore: 80, examScore: 68, stage: "SCREENED" },
  { name: "Dawit Bekele",     role: "Flight Engineer", match: 78, cvScore: 80, examScore: 74, stage: "SCREENED" },
  { name: "Selam Haile",      role: "Cabin Crew Lead", match: 82, cvScore: 85, examScore: 79, stage: "SCREENED" },
];

const accuracyTrend = [
  { week: "W1", accuracy: 88 },
  { week: "W2", accuracy: 90 },
  { week: "W3", accuracy: 91 },
  { week: "W4", accuracy: 89 },
  { week: "W5", accuracy: 93 },
  { week: "W6", accuracy: 95 },
];

const roleBreakdown = [
  { role: "Senior Pilot",    applied: 142, screened: 28, shortlisted: 5 },
  { role: "Flight Engineer", applied: 89,  screened: 14, shortlisted: 4 },
  { role: "Cabin Crew Lead", applied: 201, screened: 41, shortlisted: 8 },
  { role: "Avionics Tech.",  applied: 68,  screened: 17, shortlisted: 3 },
];

const scatterData = [
  { cv: 96, exam: 91, match: 94, name: "Amanuel" },
  { cv: 89, exam: 94, match: 91, name: "Hana" },
  { cv: 80, exam: 74, match: 78, name: "Dawit" },
  { cv: 85, exam: 79, match: 82, name: "Selam" },
  { cv: 74, exam: 68, match: 71, name: "Yonas" },
  { cv: 55, exam: 62, match: 58, name: "Tigist" },
  { cv: 49, exam: 45, match: 47, name: "Samuel" },
  { cv: 29, exam: 33, match: 30, name: "Abel" },
];

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
  const [exported, setExported] = useState(false);

  function handleExport() {
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
            Exportable shortlists, AI accuracy trends, and per-role funnel analytics
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-3 border border-[var(--c-accent)] hover:bg-[var(--c-accent)]/08 transition-colors"
        >
          {exported ? (
            <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[1.5px]">EXPORTED /</span>
          ) : (
            <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[1.5px]">EXPORT CSV /</span>
          )}
        </button>
      </div>

      {/* Shortlist table */}
      <div className="mb-8">
        <SectionLabel index="A">CURRENT SHORTLIST</SectionLabel>
        <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
            {["NAME / ROLE", "MATCH %", "CV SCORE", "EXAM SCORE", "STAGE"].map((h) => (
              <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
            ))}
          </div>
          {shortlistData.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors"
            >
              <div className="flex flex-col gap-[2px]">
                <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{c.name}</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{c.role}</span>
              </div>
              <span className="font-grotesk text-[16px] font-bold" style={{ color: matchColor(c.match) }}>{c.match}%</span>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{c.cvScore}%</span>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{c.examScore}%</span>
              <span
                className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px]"
                style={{ color: c.stage === "INTERVIEWED" ? "var(--c-accent)" : "var(--c-text-sub)", background: c.stage === "INTERVIEWED" ? "var(--c-accent)14" : "var(--c-text-sub)14" }}
              >
                {c.stage}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Accuracy trend */}
        <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <SectionLabel index="B">AI MATCH ACCURACY TREND (%)</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={accuracyTrend}>
              <XAxis
                dataKey="week"
                tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)", letterSpacing: "1px" }}
                axisLine={{ stroke: "var(--c-border-soft)" }} tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false} tickLine={false} width={32} domain={[80, 100]} unit="%" />
              <Tooltip contentStyle={TooltipStyle} cursor={{ stroke: "var(--c-border)", strokeWidth: 1 }} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--c-accent)" strokeWidth={1.5}
                dot={{ r: 3, fill: "var(--c-accent)", strokeWidth: 0 }}
                activeDot={{ r: 4, fill: "var(--c-accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] mt-3 tracking-[0.5px]">
            Accuracy measured by recruiter acceptance rate of AI-recommended shortlist
          </p>
        </div>

        {/* CV vs Exam scatter */}
        <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <SectionLabel index="C">CV SCORE vs. EXAM SCORE CORRELATION</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <XAxis
                type="number" dataKey="cv" name="CV Score"
                tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={{ stroke: "var(--c-border-soft)" }} tickLine={false} domain={[20, 100]} unit="%" label={{ value: "CV %", position: "insideBottom", offset: -2, fill: "var(--c-text-faint)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }}
              />
              <YAxis
                type="number" dataKey="exam" name="Exam Score"
                tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }}
                axisLine={false} tickLine={false} width={32} domain={[20, 100]} unit="%"
              />
              <ZAxis range={[40, 40]} />
              <Tooltip contentStyle={TooltipStyle} cursor={{ strokeDasharray: "3 3", stroke: "var(--c-border)" }} />
              <Scatter data={scatterData} name="Candidates">
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={matchColor(entry.match)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role breakdown */}
      <div className="mb-8">
        <SectionLabel index="D">ROLE-LEVEL FUNNEL BREAKDOWN</SectionLabel>
        <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
            {["ROLE", "APPLIED", "SCREENED", "SHORTLISTED", "SCREEN RATE", "SHORTLIST RATE"].map((h) => (
              <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
            ))}
          </div>
          {roleBreakdown.map((r, i) => {
            const screenRate = Math.round((r.screened / r.applied) * 100);
            const shortlistRate = Math.round((r.shortlisted / r.screened) * 100);
            return (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors">
                <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{r.role}</span>
                <span className="font-grotesk text-[14px] font-bold text-[var(--c-text)]">{r.applied}</span>
                <span className="font-grotesk text-[14px] font-bold text-[var(--c-text-sub)]">{r.screened}</span>
                <span className="font-grotesk text-[14px] font-bold text-[var(--c-accent)]">{r.shortlisted}</span>
                <span className="font-ibm-mono text-[10px]" style={{ color: screenRate >= 20 ? "var(--c-accent)" : "var(--c-text-sub)" }}>{screenRate}%</span>
                <span className="font-ibm-mono text-[10px]" style={{ color: shortlistRate >= 20 ? "var(--c-accent)" : "var(--c-text-sub)" }}>{shortlistRate}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grouped bar by role */}
      <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
        <SectionLabel index="E">PIPELINE VOLUME BY ROLE</SectionLabel>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={roleBreakdown} barGap={2} barSize={14}>
            <XAxis
              dataKey="role"
              tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)", letterSpacing: "1px" }}
              axisLine={{ stroke: "var(--c-border-soft)" }} tickLine={false}
            />
            <YAxis tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={TooltipStyle} cursor={{ fill: "rgba(255,214,0,0.04)" }} />
            <Bar dataKey="applied" fill="var(--c-border)" name="Applied" />
            <Bar dataKey="screened" fill="var(--c-text-sub)" name="Screened" />
            <Bar dataKey="shortlisted" fill="var(--c-accent)" name="Shortlisted" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3">
          {[{ label: "APPLIED", color: "var(--c-border)" }, { label: "SCREENED", color: "var(--c-text-sub)" }, { label: "SHORTLISTED", color: "var(--c-accent)" }].map((l) => (
            <div key={l.label} className="flex items-center gap-[6px]">
              <div className="w-[8px] h-[8px]" style={{ background: l.color, border: l.color === "var(--c-border)" ? "1px solid var(--c-text-dim)" : "none" }} />
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
