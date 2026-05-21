"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = "APPLIED" | "SCREENED" | "EXAM PENDING" | "INTERVIEWED" | "REJECTED";

interface Candidate {
  id: string;
  name: string;
  role: string;
  match: number;
  stage: Stage;
  flag?: string;
}

const STAGES: Stage[] = ["APPLIED", "SCREENED", "EXAM PENDING", "INTERVIEWED", "REJECTED"];

const STAGE_CONFIG: Record<Stage, { color: string; count: number }> = {
  "APPLIED":      { color: "var(--c-text-muted)",    count: 5 },
  "SCREENED":     { color: "var(--c-accent)", count: 4 },
  "EXAM PENDING": { color: "var(--c-accent-hover)", count: 3 },
  "INTERVIEWED":  { color: "var(--c-warn)", count: 2 },
  "REJECTED":     { color: "var(--c-text-faint)",    count: 2 },
};

const initialCandidates: Candidate[] = [
  { id: "C001", name: "Amanuel Tadesse", role: "Senior Pilot", match: 94, stage: "INTERVIEWED", flag: "TOP MATCH" },
  { id: "C002", name: "Hana Girma",      role: "Senior Pilot", match: 91, stage: "INTERVIEWED", flag: "TOP MATCH" },
  { id: "C003", name: "Dawit Bekele",    role: "Flight Engineer", match: 78, stage: "SCREENED" },
  { id: "C004", name: "Selam Haile",     role: "Cabin Crew Lead", match: 82, stage: "SCREENED" },
  { id: "C005", name: "Yonas Alemu",     role: "Avionics Tech.", match: 71, stage: "EXAM PENDING" },
  { id: "C006", name: "Meron Desta",     role: "Cabin Crew Lead", match: 66, stage: "EXAM PENDING" },
  { id: "C007", name: "Biruk Tesfaye",   role: "Flight Engineer", match: 60, stage: "EXAM PENDING" },
  { id: "C008", name: "Tigist Worku",    role: "Senior Pilot", match: 55, stage: "APPLIED" },
  { id: "C009", name: "Samuel Kebede",   role: "Avionics Tech.", match: 49, stage: "APPLIED" },
  { id: "C010", name: "Rahel Assefa",    role: "Cabin Crew Lead", match: 43, stage: "APPLIED" },
  { id: "C011", name: "Getnet Abebe",    role: "Senior Pilot", match: 38, stage: "APPLIED" },
  { id: "C012", name: "Liya Mengistu",   role: "Avionics Tech.", match: 35, stage: "APPLIED" },
  { id: "C013", name: "Abel Hailu",      role: "Flight Engineer", match: 29, stage: "REJECTED" },
  { id: "C014", name: "Kalkidan Wubet",  role: "Cabin Crew Lead", match: 22, stage: "REJECTED" },
  { id: "C015", name: "Mikias Solomon",  role: "Senior Pilot", match: 68, stage: "SCREENED" },
  { id: "C016", name: "Eden Tadesse",    role: "Flight Engineer", match: 74, stage: "SCREENED" },
];

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  if (score >= 45) return "var(--c-text-sub)";
  return "var(--c-warn)";
}

function CandidateCard({
  candidate,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  candidate: Candidate;
  onMove: (id: string, direction: "left" | "right") => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  const stageIndex = STAGES.indexOf(candidate.stage);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(candidate.id)}
      onDragEnd={onDragEnd}
      className="flex flex-col gap-3 p-3 bg-[var(--c-bg)] border border-[var(--c-border-soft)] hover:border-[var(--c-border)] transition-colors group cursor-grab active:cursor-grabbing"
    >
      {candidate.flag && (
        <div
          className="flex items-center gap-[5px] px-2 py-[3px] w-fit"
          style={{ background: "rgba(255,214,0,0.08)", borderLeft: "2px solid var(--c-accent)" }}
        >
          <span className="font-ibm-mono text-[8px] text-[var(--c-accent)] tracking-[1px]">{candidate.flag}</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-[2px]">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text)] leading-tight">{candidate.name}</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[0.5px]">{candidate.role}</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">{candidate.id}</span>
        </div>
        {/* Match score */}
        <div
          className="flex flex-col items-center justify-center w-[44px] h-[44px] border shrink-0"
          style={{ borderColor: matchColor(candidate.match), background: `${matchColor(candidate.match)}0D` }}
        >
          <span className="font-grotesk text-[15px] font-bold leading-none" style={{ color: matchColor(candidate.match) }}>
            {candidate.match}
          </span>
          <span className="font-ibm-mono text-[7px] text-[var(--c-text-dim)]">%</span>
        </div>
      </div>

      {/* Stage badge */}
      <div className="flex items-center justify-between">
        <span
          className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px]"
          style={{
            color: STAGE_CONFIG[candidate.stage].color,
            background: `${STAGE_CONFIG[candidate.stage].color}14`,
          }}
        >
          {candidate.stage}
        </span>
        {/* Move arrows */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(candidate.id, "left")}
            disabled={stageIndex === 0}
            className="w-[20px] h-[20px] flex items-center justify-center text-[var(--c-text-dim)] hover:text-[var(--c-accent)] disabled:opacity-20 transition-colors"
            aria-label="Move left"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M6 4H2M4 2L2 4l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
            </svg>
          </button>
          <button
            onClick={() => onMove(candidate.id, "right")}
            disabled={stageIndex === STAGES.length - 1}
            className="w-[20px] h-[20px] flex items-center justify-center text-[var(--c-text-dim)] hover:text-[var(--c-accent)] disabled:opacity-20 transition-colors"
            aria-label="Move right"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M2 4h4M4 2l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  const roles = ["ALL", ...Array.from(new Set(initialCandidates.map((c) => c.role)))];

  const filtered = candidates.filter((c) => roleFilter === "ALL" || c.role === roleFilter);

  function moveCandidate(id: string, direction: "left" | "right") {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.indexOf(c.stage);
        const next = direction === "right" ? idx + 1 : idx - 1;
        if (next < 0 || next >= STAGES.length) return c;
        return { ...c, stage: STAGES[next] };
      })
    );
  }

  function moveCandidateToStage(id: string, stage: Stage) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
  }

  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverStage(null);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[04] // CANDIDATE PIPELINE</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Kanban Pipeline
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Drag cards between columns or use the arrow controls to move candidates through stages
        </p>
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)] mb-6 w-fit">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className="px-4 py-2 font-ibm-mono text-[9px] tracking-[1px] transition-colors"
            style={{
              background: roleFilter === role ? "var(--c-accent)" : "var(--c-bg-elev)",
              color: roleFilter === role ? "var(--c-text)" : "var(--c-text-muted)",
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex gap-[1px] bg-[var(--c-border-soft)] overflow-x-auto pb-2">
        {STAGES.map((stage) => {
          const stageCandidates = filtered.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              className="flex flex-col min-w-[220px] flex-1 bg-[var(--c-bg)]"
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverStage !== stage) setDragOverStage(stage);
              }}
              onDragLeave={() => {
                if (dragOverStage === stage) setDragOverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId) moveCandidateToStage(draggingId, stage);
                setDragOverStage(null);
                setDraggingId(null);
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--c-border-soft)] bg-[var(--c-bg-elev)] sticky top-0">
                <div className="flex items-center gap-2">
                  <div className="w-[6px] h-[6px]" style={{ background: STAGE_CONFIG[stage].color }} />
                  <span
                    className="font-ibm-mono text-[9px] tracking-[1.5px]"
                    style={{ color: STAGE_CONFIG[stage].color }}
                  >
                    {stage}
                  </span>
                </div>
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)]">{stageCandidates.length}</span>
              </div>

              {/* Cards */}
              <div
                className="flex flex-col gap-[1px] p-2 bg-[var(--c-border-soft)] flex-1 min-h-[400px] transition-colors"
                style={{
                  outline: dragOverStage === stage ? "2px dashed var(--c-accent)" : "none",
                  outlineOffset: dragOverStage === stage ? "-2px" : "0px",
                }}
              >
                {stageCandidates.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 bg-[var(--c-bg)] min-h-[80px]">
                    <span className="font-ibm-mono text-[9px] text-[var(--c-border)] tracking-[1px]">EMPTY</span>
                  </div>
                ) : (
                  stageCandidates.map((c) => (
                    <div key={c.id} style={{ opacity: draggingId === c.id ? 0.45 : 1 }}>
                      <CandidateCard
                        candidate={c}
                        onMove={moveCandidate}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 flex-wrap">
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">MATCH SCORE:</span>
        {[
          { label: "85–100% EXCELLENT", color: "var(--c-accent)" },
          { label: "65–84% GOOD",        color: "var(--c-accent-hover)" },
          { label: "45–64% FAIR",         color: "var(--c-text-sub)" },
          { label: "&lt;45% LOW",             color: "var(--c-warn)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-[6px]">
            <div className="w-[6px] h-[6px]" style={{ background: l.color }} />
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
