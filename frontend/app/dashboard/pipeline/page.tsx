"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage =
  | "SUBMITTED"
  | "AI_SCREENING"
  | "EXAM_AUTHORIZED"
  | "EXAM_COMPLETED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "SELECTED"
  | "REJECTED"
  | "WAITLISTED"
  | "HARD_FILTER_FAILED";

interface AppCard {
  id: number;
  name: string;
  jobTitle: string;
  finalScore: number;
  status: Stage;
}

interface BackendApp {
  id: number;
  jobTitle: string;
  candidateName: string;
  status: string;
  finalScore: number | null;
}

const STAGES: Stage[] = [
  "SUBMITTED",
  "AI_SCREENING",
  "EXAM_AUTHORIZED",
  "EXAM_COMPLETED",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "REJECTED",
];

const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: "APPLIED",
  AI_SCREENING: "SCREENING",
  EXAM_AUTHORIZED: "EXAM AUTH",
  EXAM_COMPLETED: "EXAM DONE",
  SHORTLISTED: "SHORTLISTED",
  INTERVIEW_SCHEDULED: "INTERVIEW",
  SELECTED: "SELECTED",
  REJECTED: "REJECTED",
  WAITLISTED: "WAITLISTED",
  HARD_FILTER_FAILED: "FILTERED OUT",
};

const STAGE_COLOR: Record<string, string> = {
  SUBMITTED: "var(--c-text-muted)",
  AI_SCREENING: "var(--c-text-sub)",
  EXAM_AUTHORIZED: "var(--c-accent-hover)",
  EXAM_COMPLETED: "var(--c-accent-hover)",
  SHORTLISTED: "var(--c-accent)",
  INTERVIEW_SCHEDULED: "#64B4FF",
  SELECTED: "var(--c-accent)",
  REJECTED: "var(--c-warn)",
  WAITLISTED: "var(--c-text-sub)",
  HARD_FILTER_FAILED: "var(--c-warn)",
};

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  if (score >= 45) return "var(--c-text-sub)";
  return "var(--c-warn)";
}

function CandidateCard({ app }: { app: AppCard }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-[var(--c-bg)] border border-[var(--c-border-soft)] hover:border-[var(--c-border)] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-[2px] min-w-0">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text)] leading-tight truncate">{app.name}</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[0.5px] truncate">{app.jobTitle}</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">APP-{app.id}</span>
        </div>
        {app.finalScore > 0 && (
          <div
            className="flex flex-col items-center justify-center w-[40px] h-[40px] border shrink-0"
            style={{ borderColor: matchColor(app.finalScore), background: `${matchColor(app.finalScore)}0D` }}
          >
            <span className="font-grotesk text-[14px] font-bold leading-none" style={{ color: matchColor(app.finalScore) }}>
              {Math.round(app.finalScore)}
            </span>
            <span className="font-ibm-mono text-[7px] text-[var(--c-text-dim)]">%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [apps, setApps] = useState<AppCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("ALL");

  const load = useCallback(async () => {
    const { data } = await apiFetch<BackendApp[]>("/api/v1/recruiters/applications");
    if (data) {
      setApps(data.map((a) => ({
        id: a.id,
        name: a.candidateName,
        jobTitle: a.jobTitle,
        finalScore: a.finalScore ?? 0,
        status: a.status as Stage,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const jobs = ["ALL", ...Array.from(new Set(apps.map((a) => a.jobTitle)))];
  const filtered = apps.filter((a) => jobFilter === "ALL" || a.jobTitle === jobFilter);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[04] // CANDIDATE PIPELINE</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Kanban Pipeline
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Real-time view of all applications across recruitment stages
        </p>
      </div>

      {/* Job filter */}
      <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)] mb-6 w-fit flex-wrap">
        {jobs.map((j) => (
          <button
            key={j}
            onClick={() => setJobFilter(j)}
            className="px-4 py-2 font-ibm-mono text-[9px] tracking-[1px] transition-colors whitespace-nowrap"
            style={{
              background: jobFilter === j ? "var(--c-accent)" : "var(--c-bg-elev)",
              color: jobFilter === j ? "var(--c-text)" : "var(--c-text-muted)",
            }}
          >
            {j}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">LOADING PIPELINE...</div>
      ) : (
        <>
          {/* Kanban board */}
          <div className="flex gap-[1px] bg-[var(--c-border-soft)] overflow-x-auto pb-2">
            {STAGES.map((stage) => {
              const stageApps = filtered.filter((a) => a.status === stage);
              const color = STAGE_COLOR[stage] ?? "var(--c-text-muted)";
              return (
                <div key={stage} className="flex flex-col min-w-[200px] flex-1 bg-[var(--c-bg)]">
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--c-border-soft)] bg-[var(--c-bg-elev)] sticky top-0">
                    <div className="flex items-center gap-2">
                      <div className="w-[6px] h-[6px]" style={{ background: color }} />
                      <span className="font-ibm-mono text-[8px] tracking-[1.5px]" style={{ color }}>
                        {STAGE_LABELS[stage] ?? stage}
                      </span>
                    </div>
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)]">{stageApps.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-[1px] p-2 bg-[var(--c-border-soft)] flex-1 min-h-[300px]">
                    {stageApps.length === 0 ? (
                      <div className="flex items-center justify-center flex-1 bg-[var(--c-bg)] min-h-[60px]">
                        <span className="font-ibm-mono text-[9px] text-[var(--c-border)] tracking-[1px]">EMPTY</span>
                      </div>
                    ) : (
                      stageApps.map((a) => <CandidateCard key={a.id} app={a} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Also show HARD_FILTER_FAILED and WAITLISTED if any */}
          {filtered.some((a) => a.status === "HARD_FILTER_FAILED" || a.status === "WAITLISTED") && (
            <div className="mt-4 p-4 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[3px] h-[14px] bg-[var(--c-warn)] shrink-0" />
                <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">OTHER STATUSES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filtered.filter((a) => a.status === "HARD_FILTER_FAILED" || a.status === "WAITLISTED").map((a) => (
                  <div key={a.id} className="px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border-soft)]">
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text)]">{a.name}</span>
                    <span className="font-ibm-mono text-[8px] text-[var(--c-warn)] ml-2">{STAGE_LABELS[a.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mt-4 flex-wrap">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
              {filtered.length} total applications across {new Set(filtered.map(a => a.jobTitle)).size} job(s)
            </span>
            <button
              onClick={() => { setLoading(true); load(); }}
              className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px]"
            >
              REFRESH /
            </button>
          </div>
        </>
      )}
    </div>
  );
}
