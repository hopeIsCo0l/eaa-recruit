"use client";

import { useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  id: string;
  name: string;
  role: string;
  match: number;
  cvScore: number;
  examScore: number;
  expYears: number;
  stage: string;
  topTerms: string[];
  semanticMatches: { candidate: string; requirement: string; score: number }[];
  examComparison: { question: string; candidateScore: number; idealScore: number }[];
}

const candidates: Candidate[] = [
  {
    id: "C001", name: "Amanuel Tadesse", role: "Senior Pilot (B787)", match: 94,
    cvScore: 96, examScore: 91, expYears: 12, stage: "INTERVIEWED",
    topTerms: ["B787 Type Rating", "Navigation Systems", "ATPL License", "IFR Operations", "CRM Training", "ICAO English L5"],
    semanticMatches: [
      { candidate: "Mentioned 'Navigation Systems'",           requirement: "Avionics & Navigation Knowledge", score: 97 },
      { candidate: "12 yrs B787 command experience",           requirement: "5+ Years PIC Experience",         score: 95 },
      { candidate: "ICAO English Level 5 certification",       requirement: "ICAO English Level 4+",           score: 100 },
      { candidate: "Referenced 'Crew Resource Management'",   requirement: "CRM & Safety Culture",            score: 88 },
    ],
    examComparison: [
      { question: "Emergency Procedures", candidateScore: 95, idealScore: 100 },
      { question: "Meteorology",          candidateScore: 88, idealScore: 100 },
      { question: "Air Law",              candidateScore: 91, idealScore: 100 },
      { question: "Navigation",           candidateScore: 97, idealScore: 100 },
    ],
  },
  {
    id: "C002", name: "Hana Girma", role: "Senior Pilot (B787)", match: 91,
    cvScore: 89, examScore: 94, expYears: 9, stage: "INTERVIEWED",
    topTerms: ["CPL License", "Instrument Rating", "B737 Experience", "Safety Management", "EASA Certified"],
    semanticMatches: [
      { candidate: "9 years commercial flying",               requirement: "5+ Years PIC Experience",  score: 90 },
      { candidate: "EASA-certified co-pilot",                 requirement: "EASA Certification",       score: 95 },
      { candidate: "References 'Safety Management System'",   requirement: "CRM & Safety Culture",     score: 85 },
    ],
    examComparison: [
      { question: "Emergency Procedures", candidateScore: 92, idealScore: 100 },
      { question: "Meteorology",          candidateScore: 96, idealScore: 100 },
      { question: "Air Law",              candidateScore: 94, idealScore: 100 },
      { question: "Navigation",           candidateScore: 90, idealScore: 100 },
    ],
  },
  {
    id: "C003", name: "Dawit Bekele", role: "Flight Engineer", match: 78,
    cvScore: 80, examScore: 74, expYears: 6, stage: "SCREENED",
    topTerms: ["Engine Systems", "Hydraulics", "Fuel Management", "APU Operations"],
    semanticMatches: [
      { candidate: "Hydraulic systems maintenance",  requirement: "Aircraft Systems Knowledge", score: 82 },
      { candidate: "6 years engineering experience", requirement: "5+ Years Experience",       score: 78 },
    ],
    examComparison: [
      { question: "Propulsion",         candidateScore: 78, idealScore: 100 },
      { question: "Electrical Systems", candidateScore: 72, idealScore: 100 },
      { question: "Hydraulics",         candidateScore: 80, idealScore: 100 },
    ],
  },
  {
    id: "C005", name: "Yonas Alemu", role: "Avionics Technician", match: 71,
    cvScore: 74, examScore: 68, expYears: 4, stage: "EXAM PENDING",
    topTerms: ["Avionics", "ILS Calibration", "VHF Systems", "FMS Maintenance"],
    semanticMatches: [
      { candidate: "VHF/UHF avionics repair",   requirement: "Avionics Diploma",         score: 75 },
      { candidate: "ILS and NAV system calibration", requirement: "Navigation Systems",   score: 70 },
    ],
    examComparison: [
      { question: "Avionics Systems",  candidateScore: 71, idealScore: 100 },
      { question: "Radio Navigation",  candidateScore: 65, idealScore: 100 },
    ],
  },
];

const TooltipStyle: React.CSSProperties = {
  background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 0,
  padding: "8px 12px", fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: "9px", color: "var(--c-text)", letterSpacing: "1px",
};

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  if (score >= 45) return "var(--c-text-sub)";
  return "var(--c-warn)";
}

// ─── XAI Modal ────────────────────────────────────────────────────────────────
function XAIModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const gaugeData = [{ value: candidate.match, fill: matchColor(candidate.match) }];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border)] w-full max-w-[760px] max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border-soft)] sticky top-0 bg-[var(--c-bg-elev)] z-10">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)]" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">XAI DECISION REPORT</span>
            </div>
            <span className="font-grotesk text-[19px] font-bold text-[var(--c-text)] pl-[18px]">
              {candidate.name}
            </span>
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] pl-[18px]">{candidate.role} // {candidate.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center text-[var(--c-text-dim)] hover:text-[var(--c-text)] transition-colors border border-[var(--c-border)]"
            aria-label="Close modal"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          {/* Score gauge + sub-scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[2px] mb-1">OVERALL AI MATCH SCORE</span>
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart cx={90} cy={90} innerRadius={55} outerRadius={80} data={gaugeData} startAngle={220} endAngle={-40}>
                    <RadialBar dataKey="value" cornerRadius={0} background={{ fill: "var(--c-bg-muted)" }}>
                      <Cell fill={matchColor(candidate.match)} />
                    </RadialBar>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-grotesk text-[37px] font-bold leading-none" style={{ color: matchColor(candidate.match) }}>
                    {candidate.match}
                  </span>
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)]">%</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4">
              {[
                { label: "CV SIMILARITY (VECTOR MATCH)", value: candidate.cvScore,   weight: "40%" },
                { label: "TECHNICAL EXAM SCORE",          value: candidate.examScore, weight: "40%" },
                { label: "EXPERIENCE YEARS",              value: Math.min(100, candidate.expYears * 8), weight: "20%" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[1px]">
                      <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] tracking-[1px]">{item.label}</span>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)]">WEIGHT: {item.weight}</span>
                    </div>
                    <span className="font-grotesk text-[19px] font-bold" style={{ color: matchColor(item.value) }}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-[var(--c-bg-muted)]">
                    <div className="h-full transition-all" style={{ width: `${item.value}%`, background: matchColor(item.value) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic alignment map */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">SEMANTIC ALIGNMENT MAP</span>
            </div>
            <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
              {candidate.semanticMatches.map((match, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 bg-[var(--c-bg-elev)]">
                  <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text)]">{match.candidate}</span>
                    <div className="flex items-center gap-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4h6M4 1l3 3-3 3" stroke="var(--c-text-dim)" strokeWidth="1.2" strokeLinecap="square" /></svg>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{match.requirement}</span>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center w-[40px] h-[22px] shrink-0"
                    style={{ background: `${matchColor(match.score)}14`, border: `1px solid ${matchColor(match.score)}40` }}
                  >
                    <span className="font-ibm-mono text-[9px] font-bold" style={{ color: matchColor(match.score) }}>
                      {match.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top contributing terms */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">TOP CONTRIBUTING TERMS</span>
            </div>
            <div className="flex flex-wrap gap-[1px] bg-[var(--c-border-soft)]">
              {candidate.topTerms.map((term) => (
                <span key={term} className="font-ibm-mono text-[9px] text-[var(--c-accent)] bg-[var(--c-bg-elev)] px-3 py-2 tracking-[0.5px]">
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* Exam performance */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">EXAM PERFORMANCE vs. IDEAL VECTOR</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={candidate.examComparison} barGap={2} barSize={16}>
                <XAxis
                  dataKey="question"
                  tick={{ fill: "var(--c-text-dim)", fontSize: 8, fontFamily: "var(--font-ibm-plex-mono)", letterSpacing: "1px" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={TooltipStyle} cursor={{ fill: "rgba(255,214,0,0.04)" }} />
                <Bar dataKey="idealScore" fill="var(--c-bg-muted)" name="Ideal" />
                <Bar dataKey="candidateScore" fill="var(--c-accent)" name="Candidate" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-[6px]"><div className="w-[8px] h-[8px] bg-[var(--c-accent)]" /><span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)]">CANDIDATE</span></div>
              <div className="flex items-center gap-[6px]"><div className="w-[8px] h-[8px] bg-[var(--c-bg-muted)] border border-[var(--c-border)]" /><span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)]">IDEAL ANSWER VECTOR</span></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--c-border-soft)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
              Generated by EAA XAI Engine v2.1 — Proclamation 1329/2023 compliant
            </span>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-[var(--c-border)] font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] transition-colors tracking-[1px]">
                EXPORT PDF /
              </button>
              <button className="px-4 py-2 bg-[var(--c-accent)] font-ibm-mono text-[9px] font-bold text-[var(--c-text)] tracking-[1px] hover:bg-[var(--c-accent-hover)] transition-colors">
                SHORTLIST /
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const roles = ["ALL", ...Array.from(new Set(candidates.map((c) => c.role)))];

  const filtered = candidates.filter((c) => {
    const matchesRole = roleFilter === "ALL" || c.role === roleFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {selected && <XAIModal candidate={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[03] // CANDIDATE POOL</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Candidate Pool
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Search candidates and open the XAI Decision Report for any profile
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, role, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]"
          />
        </div>
        <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)]">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="px-4 py-3 font-ibm-mono text-[9px] tracking-[1px] transition-colors whitespace-nowrap"
              style={{ background: roleFilter === role ? "var(--c-accent)" : "var(--c-bg-elev)", color: roleFilter === role ? "var(--c-text)" : "var(--c-text-muted)" }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
        {/* Header row */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
          {["ID", "NAME / ROLE", "MATCH", "CV", "EXAM", "STAGE", "ACTIONS"].map((h) => (
            <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">NO CANDIDATES FOUND</span>
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors"
          >
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{c.id}</span>
            <div className="flex flex-col gap-[2px] min-w-0">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{c.name}</span>
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{c.role}</span>
            </div>
            <span className="font-grotesk text-[16px] font-bold" style={{ color: matchColor(c.match) }}>{c.match}%</span>
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{c.cvScore}%</span>
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{c.examScore}%</span>
            <span
              className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px] whitespace-nowrap"
              style={{ color: c.stage === "INTERVIEWED" ? "var(--c-accent)" : c.stage === "REJECTED" ? "var(--c-warn)" : "var(--c-text-sub)", background: c.stage === "INTERVIEWED" ? "var(--c-accent)14" : c.stage === "REJECTED" ? "var(--c-warn)14" : "var(--c-text-sub)14" }}
            >
              {c.stage}
            </span>
            <button
              onClick={() => setSelected(c)}
              className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors whitespace-nowrap"
            >
              XAI REPORT /
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
          Showing {filtered.length} of {candidates.length} candidates — click XAI REPORT for full explainability
        </span>
      </div>
    </div>
  );
}
