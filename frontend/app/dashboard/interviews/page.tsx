"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Slot {
  id: number;
  date: string;       // "2026-06-01"
  startTime: string;  // "09:00"
  endTime: string;    // "10:00"
  booked: boolean;
}

interface Interview {
  id: number;
  candidateName: string;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
  finalScore: number;
}

interface BackendApp {
  id: number;
  candidateName: string;
  jobTitle: string;
  status: string;
  finalScore: number | null;
  interviewDate: string | null;
  interviewTime: string | null;
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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function InterviewsPage() {
  // Availability slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Scheduled interviews from applications
  const [interviews, setInterviews] = useState<Interview[]>([]);

  // Add slot form
  const [showAdd, setShowAdd] = useState(false);
  const [formDate, setFormDate] = useState(todayStr());
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    const { data, error } = await apiFetch<Slot[]>("/api/v1/recruiters/availability");
    if (error) { setError(error.message); setSlotsLoading(false); return; }
    setSlots(data ?? []);
    setSlotsLoading(false);
  }, []);

  const loadInterviews = useCallback(async () => {
    const { data } = await apiFetch<BackendApp[]>("/api/v1/recruiters/applications");
    if (data) {
      setInterviews(
        data
          .filter((a) => a.status === "INTERVIEW_SCHEDULED" && a.interviewDate)
          .map((a) => ({
            id: a.id,
            candidateName: a.candidateName,
            jobTitle: a.jobTitle,
            interviewDate: a.interviewDate!,
            interviewTime: a.interviewTime ?? "—",
            finalScore: a.finalScore ?? 0,
          }))
      );
    }
  }, []);

  useEffect(() => { loadSlots(); loadInterviews(); }, [loadSlots, loadInterviews]);

  async function addSlot() {
    setError(null);
    if (formEnd <= formStart) { setError("End time must be after start time"); return; }
    setSubmitting(true);
    const { error } = await apiFetch<Slot[]>("/api/v1/recruiters/availability", {
      method: "POST",
      body: JSON.stringify({
        slots: [{ date: formDate, startTime: formStart, endTime: formEnd }],
      }),
    });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setSuccess("Slot added");
    setShowAdd(false);
    setTimeout(() => setSuccess(null), 3000);
    await loadSlots();
  }

  // Group slots by date for calendar view
  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    (acc[s.date] ??= []).push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[05] // INTERVIEW SCHEDULER</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Interview Scheduler
          </h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Manage your availability slots and view scheduled interviews
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px] animate-pulse">{success}</span>}
          <button
            onClick={() => { setShowAdd((v) => !v); setError(null); }}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
          >
            <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px]">
              {showAdd ? "CANCEL /" : "+ ADD SLOT"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/5">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">{error}</span>
        </div>
      )}

      {/* Add slot form */}
      {showAdd && (
        <div className="border border-[var(--c-accent)]/30 bg-[var(--c-bg-elev)] p-6 mb-8">
          <SectionLabel index="A">NEW AVAILABILITY SLOT</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">DATE</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">START TIME</label>
              <input
                type="time"
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">END TIME</label>
              <input
                type="time"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={addSlot}
              disabled={submitting}
              className="px-6 py-3 bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px] hover:bg-[var(--c-accent-hover)] transition-colors disabled:opacity-30"
            >
              {submitting ? "ADDING..." : "CONFIRM SLOT /"}
            </button>
          </div>
        </div>
      )}

      {/* Availability slots */}
      <div className="mb-8">
        <SectionLabel index="B">YOUR AVAILABILITY SLOTS</SectionLabel>
        {slotsLoading ? (
          <div className="py-6 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">LOADING...</div>
        ) : slots.length === 0 ? (
          <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)] p-8 text-center">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">
              NO AVAILABILITY SLOTS — CLICK &quot;+ ADD SLOT&quot; TO CREATE ONE
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDates.map((date) => (
              <div key={date} className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
                <div className="px-4 py-3 border-b border-[var(--c-border-soft)] bg-[var(--c-bg)]">
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text)] tracking-[1px]">
                    {new Date(date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
                  {slotsByDate[date].map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-[var(--c-bg-elev)]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-[3px] h-[16px]"
                          style={{ background: s.booked ? "#64B4FF" : "var(--c-accent)" }}
                        />
                        <span className="font-ibm-mono text-[11px] text-[var(--c-text)]">
                          {s.startTime.slice(0, 5)} — {s.endTime.slice(0, 5)}
                        </span>
                      </div>
                      <span
                        className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px]"
                        style={{
                          color: s.booked ? "#64B4FF" : "var(--c-accent)",
                          background: s.booked ? "rgba(100,180,255,0.08)" : "rgba(255,214,0,0.08)",
                        }}
                      >
                        {s.booked ? "BOOKED" : "AVAILABLE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
            {slots.length} slot(s) — {slots.filter(s => s.booked).length} booked
          </span>
          <button
            onClick={() => { setSlotsLoading(true); loadSlots(); }}
            className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px]"
          >
            REFRESH /
          </button>
        </div>
      </div>

      {/* Scheduled interviews */}
      <div>
        <SectionLabel index="C">SCHEDULED INTERVIEWS</SectionLabel>
        <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
            {["ID", "CANDIDATE / JOB", "SCORE", "DATE", "TIME"].map((h) => (
              <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
            ))}
          </div>
          {interviews.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">
                NO SCHEDULED INTERVIEWS YET
              </span>
            </div>
          ) : (
            interviews.map((iv) => (
              <div key={iv.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors">
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">APP-{iv.id}</span>
                <div className="flex flex-col gap-[2px] min-w-0">
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{iv.candidateName}</span>
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] truncate">{iv.jobTitle}</span>
                </div>
                <span className="font-grotesk text-[14px] font-bold" style={{ color: iv.finalScore > 0 ? "var(--c-accent)" : "var(--c-text-dim)" }}>
                  {iv.finalScore > 0 ? `${Math.round(iv.finalScore)}%` : "—"}
                </span>
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] whitespace-nowrap">{iv.interviewDate}</span>
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] whitespace-nowrap">{iv.interviewTime}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
