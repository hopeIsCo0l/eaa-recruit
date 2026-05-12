"use client";

import { useState } from "react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

interface Interview {
  id: string;
  candidate: string;
  role: string;
  match: number;
  day: string;
  time: string;
  type: "IN-PERSON" | "VIDEO CALL" | "PANEL";
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

const initialInterviews: Interview[] = [
  { id: "INT-001", candidate: "Amanuel Tadesse", role: "Senior Pilot",     match: 94, day: "MON", time: "09:00", type: "PANEL",     status: "CONFIRMED" },
  { id: "INT-002", candidate: "Hana Girma",      role: "Senior Pilot",     match: 91, day: "MON", time: "11:00", type: "PANEL",     status: "CONFIRMED" },
  { id: "INT-003", candidate: "Selam Haile",     role: "Cabin Crew Lead",  match: 82, day: "TUE", time: "10:00", type: "VIDEO CALL",status: "PENDING" },
  { id: "INT-004", candidate: "Eden Tadesse",    role: "Flight Engineer",  match: 74, day: "TUE", time: "14:00", type: "IN-PERSON", status: "PENDING" },
  { id: "INT-005", candidate: "Dawit Bekele",    role: "Flight Engineer",  match: 78, day: "WED", time: "09:00", type: "IN-PERSON", status: "CONFIRMED" },
  { id: "INT-006", candidate: "Yonas Alemu",     role: "Avionics Tech.",   match: 71, day: "THU", time: "13:00", type: "VIDEO CALL",status: "PENDING" },
  { id: "INT-007", candidate: "Mikias Solomon",  role: "Senior Pilot",     match: 68, day: "FRI", time: "15:00", type: "VIDEO CALL",status: "CANCELLED" },
];

const shortlisted = [
  { id: "C003", name: "Dawit Bekele",   role: "Flight Engineer", match: 78 },
  { id: "C004", name: "Selam Haile",   role: "Cabin Crew Lead", match: 82 },
  { id: "C015", name: "Mikias Solomon",role: "Senior Pilot",    match: 68 },
  { id: "C016", name: "Eden Tadesse",  role: "Flight Engineer", match: 74 },
];

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  return "var(--c-text-sub)";
}

function typeColor(type: Interview["type"]) {
  if (type === "PANEL")      return "var(--c-warn)";
  if (type === "VIDEO CALL") return "var(--c-accent)";
  return "var(--c-text-sub)";
}

function statusColor(status: Interview["status"]) {
  if (status === "CONFIRMED") return "var(--c-accent)";
  if (status === "PENDING")   return "var(--c-text-sub)";
  return "var(--c-warn)";
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

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [showSchedule, setShowSchedule] = useState(false);
  const [form, setForm] = useState({ candidate: "", day: "MON", time: "09:00", type: "VIDEO CALL" as Interview["type"] });
  const [saved, setSaved] = useState(false);

  function handleSchedule() {
    if (!form.candidate) return;
    const cand = shortlisted.find((s) => s.name === form.candidate);
    if (!cand) return;
    const newInt: Interview = {
      id: `INT-00${interviews.length + 1}`,
      candidate: cand.name,
      role: cand.role,
      match: cand.match,
      day: form.day,
      time: form.time,
      type: form.type,
      status: "PENDING",
    };
    setInterviews((v) => [...v, newInt]);
    setSaved(true);
    setShowSchedule(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function confirm(id: string) {
    setInterviews((v) => v.map((i) => i.id === id ? { ...i, status: "CONFIRMED" } : i));
  }
  function cancel(id: string) {
    setInterviews((v) => v.map((i) => i.id === id ? { ...i, status: "CANCELLED" } : i));
  }

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
            Manage shortlisted candidates and sync interview slots
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px] animate-pulse">SCHEDULED /</span>}
          <button
            onClick={() => setShowSchedule((v) => !v)}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
          >
            <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px]">
              {showSchedule ? "CANCEL /" : "+ SCHEDULE"}
            </span>
          </button>
        </div>
      </div>

      {/* Schedule form */}
      {showSchedule && (
        <div className="border border-[var(--c-accent)]/30 bg-[var(--c-bg-elev)] p-6 mb-8">
          <SectionLabel index="A">NEW INTERVIEW SLOT</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            {/* Candidate select */}
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">CANDIDATE</label>
              <select
                value={form.candidate}
                onChange={(e) => setForm((f) => ({ ...f, candidate: e.target.value }))}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
              >
                <option value="">Select candidate...</option>
                {shortlisted.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} — {s.role}</option>
                ))}
              </select>
            </div>
            {/* Day */}
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">DAY</label>
              <select
                value={form.day}
                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
              >
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            {/* Time */}
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">TIME</label>
              <select
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
              >
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            {/* Type */}
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">TYPE</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Interview["type"] }))}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
              >
                <option>VIDEO CALL</option>
                <option>IN-PERSON</option>
                <option>PANEL</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSchedule}
              disabled={!form.candidate}
              className="px-6 py-3 bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px] hover:bg-[var(--c-accent-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              CONFIRM SLOT /
            </button>
          </div>
        </div>
      )}

      {/* Weekly calendar grid */}
      <div className="mb-8">
        <SectionLabel index="B">WEEKLY CALENDAR</SectionLabel>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-[1px] bg-[var(--c-border-soft)] mb-[1px]">
              <div className="bg-[var(--c-bg-elev)] py-2" />
              {DAYS.map((d) => (
                <div key={d} className="bg-[var(--c-bg-elev)] flex items-center justify-center py-3">
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[2px]">{d}</span>
                </div>
              ))}
            </div>
            {/* Time rows */}
            <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
              {TIMES.map((time) => (
                <div key={time} className="grid grid-cols-[60px_repeat(5,1fr)] gap-[1px]">
                  <div className="bg-[var(--c-bg)] flex items-center justify-center py-3">
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[1px]">{time}</span>
                  </div>
                  {DAYS.map((day) => {
                    const slot = interviews.find((i) => i.day === day && i.time === time && i.status !== "CANCELLED");
                    return (
                      <div key={day} className="bg-[var(--c-bg)] min-h-[52px] p-1">
                        {slot && (
                          <div
                            className="h-full flex flex-col gap-[2px] px-2 py-2"
                            style={{ borderLeft: `2px solid ${typeColor(slot.type)}`, background: `${typeColor(slot.type)}08` }}
                          >
                            <span className="font-ibm-mono text-[8px] text-[var(--c-text)] leading-tight truncate">{slot.candidate}</span>
                            <span className="font-ibm-mono text-[7px] text-[var(--c-text-dim)] truncate">{slot.role}</span>
                            <span className="font-ibm-mono text-[7px]" style={{ color: typeColor(slot.type) }}>{slot.type}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-5 mt-3">
              {[{ label: "PANEL", color: "var(--c-warn)" }, { label: "VIDEO CALL", color: "var(--c-accent)" }, { label: "IN-PERSON", color: "var(--c-text-sub)" }].map((l) => (
                <div key={l.label} className="flex items-center gap-[6px]">
                  <div className="w-[3px] h-[12px]" style={{ background: l.color }} />
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interview list */}
      <div>
        <SectionLabel index="C">ALL SCHEDULED INTERVIEWS</SectionLabel>
        <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
            {["ID", "CANDIDATE / ROLE", "MATCH", "SLOT", "TYPE", "STATUS", "ACTIONS"].map((h) => (
              <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
            ))}
          </div>
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-3 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors"
              style={{ opacity: interview.status === "CANCELLED" ? 0.4 : 1 }}
            >
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{interview.id}</span>
              <div className="flex flex-col gap-[2px] min-w-0">
                <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{interview.candidate}</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] truncate">{interview.role}</span>
              </div>
              <span className="font-grotesk text-[14px] font-bold" style={{ color: matchColor(interview.match) }}>{interview.match}%</span>
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] whitespace-nowrap">{interview.day} {interview.time}</span>
              <span className="font-ibm-mono text-[8px] px-2 py-[2px] whitespace-nowrap" style={{ color: typeColor(interview.type), background: `${typeColor(interview.type)}14` }}>
                {interview.type}
              </span>
              <span className="font-ibm-mono text-[8px] px-2 py-[2px] whitespace-nowrap" style={{ color: statusColor(interview.status), background: `${statusColor(interview.status)}14` }}>
                {interview.status}
              </span>
              <div className="flex items-center gap-2">
                {interview.status === "PENDING" && (
                  <>
                    <button onClick={() => confirm(interview.id)} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors">CONFIRM</button>
                    <span className="text-[var(--c-border)]">/</span>
                    <button onClick={() => cancel(interview.id)} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-warn)] tracking-[1px] transition-colors">CANCEL</button>
                  </>
                )}
                {interview.status !== "PENDING" && (
                  <span className="font-ibm-mono text-[8px] text-[var(--c-border)]">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
