"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobPosting {
  id: string;
  title: string;
  dept: string;
  status: "OPEN" | "CLOSED" | "DRAFT";
  applied: number;
  posted: string;
}

const existingJobs: JobPosting[] = [
  { id: "JOB-2024-012", title: "Senior Pilot (B787)", dept: "Flight Operations", status: "OPEN", applied: 142, posted: "10 Apr 2024" },
  { id: "JOB-2024-011", title: "Flight Engineer", dept: "Flight Operations", status: "OPEN", applied: 89, posted: "08 Apr 2024" },
  { id: "JOB-2024-010", title: "Cabin Crew Lead", dept: "In-Flight Services", status: "OPEN", applied: 201, posted: "05 Apr 2024" },
  { id: "JOB-2024-009", title: "Avionics Technician", dept: "Maintenance", status: "CLOSED", applied: 68, posted: "01 Apr 2024" },
  { id: "JOB-2024-008", title: "Ground Operations Supervisor", dept: "Ground Services", status: "DRAFT", applied: 0, posted: "—" },
];

const mandatoryKeywords = [
  "ATPL License", "B787 Type Rating", "ICAO English Level 4+",
  "CPL License", "EASA Certification", "5+ Years Experience",
  "Aircraft Maintenance License", "Avionics Diploma",
];

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[{index}]</span>
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

function Slider({
  label, value, onChange, color = "var(--c-accent)",
}: {
  label: string; value: number; onChange: (v: number) => void; color?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[1px]">{label}</span>
        <span className="font-ibm-mono text-[12px] font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="relative h-[3px] bg-[var(--c-bg-muted)] w-full">
        <div className="absolute top-0 left-0 h-full transition-all" style={{ width: `${value}%`, background: color }} />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [weights, setWeights] = useState({ cv: 40, exam: 40, experience: 20 });
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const totalWeight = weights.cv + weights.exam + weights.experience;

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const statusColor = (s: JobPosting["status"]) =>
    s === "OPEN" ? "var(--c-accent)" : s === "DRAFT" ? "var(--c-text-muted)" : "var(--c-warn)";

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[02] // MY JOB POSTINGS</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Job Creation & Weighting
          </h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Define job requirements and tune the AI scoring vector
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 px-4 py-3 bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
        >
          <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px]">
            {showCreate ? "CANCEL /" : "+ NEW JOB"}
          </span>
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="border border-[var(--c-accent)]/30 bg-[var(--c-bg-elev)] p-6 mb-8">
          <SectionLabel index="A">JOB DETAILS</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "JOB TITLE", placeholder: "e.g. Senior First Officer" },
              { label: "DEPARTMENT", placeholder: "e.g. Flight Operations" },
              { label: "LOCATION", placeholder: "e.g. Addis Ababa HQ" },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-2">
                <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]"
                />
              </div>
            ))}
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">JOB DESCRIPTION</label>
              <textarea
                rows={4}
                placeholder="Paste or type the full job description — the AI will parse this to generate the ideal candidate vector..."
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] resize-none transition-colors tracking-[0.5px] leading-relaxed"
              />
            </div>
          </div>

          {/* AI Tuner */}
          <SectionLabel index="B">AI SCORING WEIGHTS — TUNER</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="flex flex-col gap-6">
              <Slider label="CV SIMILARITY (VECTOR MATCH)" value={weights.cv} onChange={(v) => setWeights((w) => ({ ...w, cv: v }))} />
              <Slider label="TECHNICAL EXAM SCORE" value={weights.exam} onChange={(v) => setWeights((w) => ({ ...w, exam: v }))} color="var(--c-warn)" />
              <Slider label="EXPERIENCE YEARS" value={weights.experience} onChange={(v) => setWeights((w) => ({ ...w, experience: v }))} color="var(--c-accent-hover)" />

              {/* Weight total indicator */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">TOTAL WEIGHT</span>
                  <span
                    className="font-ibm-mono text-[12px] font-bold"
                    style={{ color: totalWeight === 100 ? "var(--c-accent)" : "var(--c-warn)" }}
                  >
                    {totalWeight}% {totalWeight !== 100 && "(must equal 100%)"}
                  </span>
                </div>
                <div className="w-full h-[4px] bg-[var(--c-bg-muted)] flex overflow-hidden">
                  <div style={{ width: `${weights.cv}%`, background: "var(--c-accent)" }} />
                  <div style={{ width: `${weights.exam}%`, background: "var(--c-warn)" }} />
                  <div style={{ width: `${weights.experience}%`, background: "var(--c-accent-hover)" }} />
                </div>
                <div className="flex items-center gap-4">
                  {[
                    { label: "CV", color: "var(--c-accent)" },
                    { label: "EXAM", color: "var(--c-warn)" },
                    { label: "EXP.", color: "var(--c-accent-hover)" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-[5px]">
                      <div className="w-[6px] h-[6px]" style={{ background: l.color }} />
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mandatory requirements */}
            <div className="flex flex-col gap-3">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[1.5px] mb-1">MANDATORY REQUIREMENTS</span>
              <p className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] leading-relaxed">
                Toggle must-have keywords. Candidates missing these will be auto-disqualified.
              </p>
              <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
                {mandatoryKeywords.map((kw) => (
                  <div key={kw} className="flex items-center justify-between px-4 py-3 bg-[var(--c-bg-elev)]">
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[0.5px]">{kw}</span>
                    <button
                      onClick={() => setToggles((t) => ({ ...t, [kw]: !t[kw] }))}
                      className="relative w-[36px] h-[18px] transition-colors shrink-0"
                      style={{ background: toggles[kw] ? "var(--c-accent)" : "var(--c-bg-muted)", border: "1px solid var(--c-border)" }}
                      aria-label={`Toggle ${kw}`}
                    >
                      <div
                        className="absolute top-[2px] w-[12px] h-[12px] bg-[var(--c-bg)] transition-all"
                        style={{ left: toggles[kw] ? "20px" : "2px" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--c-border-soft)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px]">
              Weights define the pgvector similarity computation for this role.
            </span>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px] animate-pulse">
                  JOB CREATED /
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={totalWeight !== 100}
                className="px-6 py-3 font-ibm-mono text-[10px] font-bold tracking-[1.5px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: totalWeight === 100 ? "var(--c-accent)" : "var(--c-bg-muted)", color: totalWeight === 100 ? "var(--c-text)" : "var(--c-text-muted)" }}
              >
                PUBLISH JOB /
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing postings table */}
      <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
        <div className="p-5 border-b border-[var(--c-border-soft)]">
          <SectionLabel index="C">EXISTING POSTINGS</SectionLabel>
        </div>
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
          {["ID", "TITLE / DEPT", "STATUS", "APPLIED", "POSTED", "ACTIONS"].map((h) => (
            <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
          ))}
        </div>
        {existingJobs.map((job) => (
          <div
            key={job.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors"
          >
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{job.id}</span>
            <div className="flex flex-col gap-[2px] min-w-0">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{job.title}</span>
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{job.dept}</span>
            </div>
            <span
              className="font-ibm-mono text-[8px] px-2 py-[3px] tracking-[1px]"
              style={{ color: statusColor(job.status), background: `${statusColor(job.status)}14` }}
            >
              {job.status}
            </span>
            <span className="font-grotesk text-[14px] font-bold text-[var(--c-text)]">{job.applied}</span>
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)]">{job.posted}</span>
            <div className="flex items-center gap-2">
              <button className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors">
                EDIT
              </button>
              <span className="text-[var(--c-border)]">/</span>
              <button className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-warn)] tracking-[1px] transition-colors">
                CLOSE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
