"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Recruiter-allowed transitions (drag targets)
const ALLOWED_DROPS: Record<string, Stage[]> = {
  EXAM_COMPLETED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["SELECTED", "REJECTED", "WAITLISTED"],
  INTERVIEW_SCHEDULED: ["SELECTED", "REJECTED", "WAITLISTED"],
};

function canDrop(fromStatus: Stage, toStatus: Stage): boolean {
  if (fromStatus === toStatus) return false;
  return ALLOWED_DROPS[fromStatus]?.includes(toStatus) ?? false;
}

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  if (score >= 45) return "var(--c-text-sub)";
  return "var(--c-warn)";
}

function CandidateCard({
  app,
  onDragStart,
  isDragging,
}: {
  app: AppCard;
  onDragStart: (e: React.DragEvent, app: AppCard) => void;
  isDragging: boolean;
}) {
  const draggable = !!ALLOWED_DROPS[app.status];
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart(e, app)}
      className={`flex flex-col gap-2 p-3 bg-[var(--c-bg)] border transition-all ${
        isDragging
          ? "border-[var(--c-accent)] opacity-50 scale-95"
          : "border-[var(--c-border-soft)] hover:border-[var(--c-border)]"
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-[2px] min-w-0">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text)] leading-tight truncate">
            {app.name}
          </span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[0.5px] truncate">
            {app.jobTitle}
          </span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">
            APP-{app.id}
          </span>
        </div>
        {app.finalScore > 0 && (
          <div
            className="flex flex-col items-center justify-center w-[40px] h-[40px] border shrink-0"
            style={{
              borderColor: matchColor(app.finalScore),
              background: `${matchColor(app.finalScore)}0D`,
            }}
          >
            <span
              className="font-grotesk text-[14px] font-bold leading-none"
              style={{ color: matchColor(app.finalScore) }}
            >
              {Math.round(app.finalScore)}
            </span>
            <span className="font-ibm-mono text-[7px] text-[var(--c-text-dim)]">%</span>
          </div>
        )}
      </div>
      {draggable && (
        <div className="flex items-center gap-1 mt-1">
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-[var(--c-text-faint)]">
            <circle cx="3" cy="2" r="1" fill="currentColor" />
            <circle cx="7" cy="2" r="1" fill="currentColor" />
            <circle cx="3" cy="5" r="1" fill="currentColor" />
            <circle cx="7" cy="5" r="1" fill="currentColor" />
            <circle cx="3" cy="8" r="1" fill="currentColor" />
            <circle cx="7" cy="8" r="1" fill="currentColor" />
          </svg>
          <span className="font-ibm-mono text-[7px] text-[var(--c-text-faint)] tracking-[0.5px]">
            DRAG TO MOVE
          </span>
        </div>
      )}
    </div>
  );
}

export default function PipelinePage() {
  const [apps, setApps] = useState<AppCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("ALL");
  const [dragItem, setDragItem] = useState<AppCard | null>(null);
  const [dragOver, setDragOver] = useState<Stage | null>(null);
  const [advancing, setAdvancing] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    const { data } = await apiFetch<BackendApp[]>("/api/v1/recruiters/applications");
    if (data) {
      setApps(
        data.map((a) => ({
          id: a.id,
          name: a.candidateName,
          jobTitle: a.jobTitle,
          finalScore: a.finalScore ?? 0,
          status: a.status as Stage,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Drag handlers ──────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, app: AppCard) => {
    setDragItem(app);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(app.id));
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    if (!dragItem) return;
    if (canDrop(dragItem.status, stage)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOver(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragItem || !canDrop(dragItem.status, targetStage)) return;

    const appId = dragItem.id;
    const fromStatus = dragItem.status;
    setDragItem(null);
    setAdvancing(appId);

    // Optimistic update
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: targetStage } : a))
    );

    const { error } = await apiFetch<void>(
      `/api/v1/recruiters/applications/${appId}/advance`,
      {
        method: "POST",
        body: JSON.stringify({ targetStatus: targetStage, notes: null }),
      }
    );

    if (error) {
      // Revert optimistic update
      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: fromStatus } : a))
      );
      showToast(error.message, false);
    } else {
      showToast(
        `APP-${appId} moved to ${STAGE_LABELS[targetStage]}`,
        true
      );
    }
    setAdvancing(null);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDragOver(null);
  };

  const jobs = ["ALL", ...Array.from(new Set(apps.map((a) => a.jobTitle)))];
  const filtered = apps.filter(
    (a) => jobFilter === "ALL" || a.jobTitle === jobFilter
  );

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 border font-ibm-mono text-[10px] tracking-[1px] animate-in fade-in"
          style={{
            background: "var(--c-bg-elev)",
            borderColor: toast.ok ? "var(--c-accent)" : "var(--c-warn)",
            color: toast.ok ? "var(--c-accent)" : "var(--c-warn)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">
          [04] // CANDIDATE PIPELINE
        </span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Kanban Pipeline
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Drag candidates between stages — only valid recruiter transitions allowed
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
              background:
                jobFilter === j ? "var(--c-accent)" : "var(--c-bg-elev)",
              color:
                jobFilter === j ? "var(--c-text)" : "var(--c-text-muted)",
            }}
          >
            {j}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">
          LOADING PIPELINE...
        </div>
      ) : (
        <>
          {/* Kanban board */}
          <div
            className="flex gap-[1px] bg-[var(--c-border-soft)] overflow-x-auto pb-2"
            onDragEnd={handleDragEnd}
          >
            {STAGES.map((stage) => {
              const stageApps = filtered.filter((a) => a.status === stage);
              const color = STAGE_COLOR[stage] ?? "var(--c-text-muted)";
              const isDropTarget =
                dragItem && canDrop(dragItem.status, stage);
              const isHovering = dragOver === stage;

              return (
                <div
                  key={stage}
                  className={`flex flex-col min-w-[200px] flex-1 transition-all ${
                    isHovering
                      ? "bg-[var(--c-accent)]/08"
                      : "bg-[var(--c-bg)]"
                  }`}
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  {/* Column header */}
                  <div
                    className={`flex items-center justify-between px-3 py-3 border-b sticky top-0 transition-all ${
                      isHovering
                        ? "border-[var(--c-accent)] bg-[var(--c-accent)]/10"
                        : "border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-[6px] h-[6px]"
                        style={{ background: color }}
                      />
                      <span
                        className="font-ibm-mono text-[8px] tracking-[1.5px]"
                        style={{ color }}
                      >
                        {STAGE_LABELS[stage] ?? stage}
                      </span>
                    </div>
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)]">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Drop indicator */}
                  {isDropTarget && (
                    <div
                      className={`mx-2 mt-1 py-1 text-center font-ibm-mono text-[7px] tracking-[1px] border border-dashed transition-all ${
                        isHovering
                          ? "border-[var(--c-accent)] text-[var(--c-accent)] bg-[var(--c-accent)]/05"
                          : "border-[var(--c-border)] text-[var(--c-text-faint)]"
                      }`}
                    >
                      {isHovering ? "DROP HERE /" : "DROP ALLOWED"}
                    </div>
                  )}

                  {/* Cards */}
                  <div className="flex flex-col gap-[1px] p-2 bg-[var(--c-border-soft)] flex-1 min-h-[300px]">
                    {stageApps.length === 0 && !isDropTarget ? (
                      <div className="flex items-center justify-center flex-1 bg-[var(--c-bg)] min-h-[60px]">
                        <span className="font-ibm-mono text-[9px] text-[var(--c-border)] tracking-[1px]">
                          EMPTY
                        </span>
                      </div>
                    ) : (
                      stageApps.map((a) => (
                        <CandidateCard
                          key={a.id}
                          app={a}
                          onDragStart={handleDragStart}
                          isDragging={
                            dragItem?.id === a.id || advancing === a.id
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Other statuses */}
          {filtered.some(
            (a) =>
              a.status === "HARD_FILTER_FAILED" ||
              a.status === "WAITLISTED"
          ) && (
            <div className="mt-4 p-4 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[3px] h-[14px] bg-[var(--c-warn)] shrink-0" />
                <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">
                  OTHER STATUSES
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filtered
                  .filter(
                    (a) =>
                      a.status === "HARD_FILTER_FAILED" ||
                      a.status === "WAITLISTED"
                  )
                  .map((a) => (
                    <div
                      key={a.id}
                      className="px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border-soft)]"
                    >
                      <span className="font-ibm-mono text-[9px] text-[var(--c-text)]">
                        {a.name}
                      </span>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-warn)] ml-2">
                        {STAGE_LABELS[a.status]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Legend + info */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
                {filtered.length} total across{" "}
                {new Set(filtered.map((a) => a.jobTitle)).size} job(s)
              </span>
              <span className="font-ibm-mono text-[7px] text-[var(--c-text-dim)] tracking-[0.5px]">
                DRAG: EXAM DONE → SHORTLIST • SHORTLISTED/INTERVIEW → SELECT/REJECT
              </span>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
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
