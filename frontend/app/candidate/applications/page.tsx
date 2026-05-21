"use client";

import Link from "next/link";

const applications = [
  {
    id: "APP-001",
    role: "Senior Pilot (B787)",
    department: "Flight Operations",
    appliedDate: "12 Apr 2025",
    lastUpdate: "13 Apr 2025",
    status: "SHORTLISTED",
    overallScore: 94,
    currentStep: "Exam Invited",
    steps: [
      { label: "CV RECEIVED",   done: true  },
      { label: "AI PROCESSING", done: true  },
      { label: "SHORTLISTED",   done: true  },
      { label: "EXAM INVITED",  done: false },
      { label: "INTERVIEW",     done: false },
      { label: "DECISION",      done: false },
    ],
  },
  {
    id: "APP-002",
    role: "Avionics Technician",
    department: "Maintenance & Engineering",
    appliedDate: "20 Apr 2025",
    lastUpdate: "20 Apr 2025",
    status: "PROCESSING",
    overallScore: 0,
    currentStep: "AI Processing",
    steps: [
      { label: "CV RECEIVED",   done: true  },
      { label: "AI PROCESSING", done: false },
      { label: "SHORTLISTED",   done: false },
      { label: "EXAM INVITED",  done: false },
      { label: "INTERVIEW",     done: false },
      { label: "DECISION",      done: false },
    ],
  },
];

function statusColor(status: string) {
  if (status === "SHORTLISTED") return "var(--c-accent)";
  if (status === "REJECTED") return "var(--c-warn)";
  return "var(--c-text-sub)";
}

export default function ApplicationsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[03] // MY APPLICATIONS</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">My Applications</h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Full history and real-time status tracking for every application you have submitted.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-[1px] bg-[var(--c-border-soft)]">
        {[
          { label: "TOTAL APPLIED",  value: applications.length },
          { label: "SHORTLISTED",    value: applications.filter((a) => a.status === "SHORTLISTED").length },
          { label: "PENDING RESULT", value: applications.filter((a) => a.status === "PROCESSING").length },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2 items-center justify-center py-6 bg-[var(--c-bg-elev)]">
            <span className="font-grotesk text-[37px] font-bold text-[var(--c-accent)] leading-none">{stat.value}</span>
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Application cards */}
      <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
        {applications.map((app) => (
          <div key={app.id} className="bg-[var(--c-bg-elev)] p-5 flex flex-col gap-5">
            {/* Card header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-grotesk text-[17px] font-bold text-[var(--c-text)]">{app.role}</span>
                  <div
                    className="flex items-center gap-[6px] px-2 py-[2px]"
                    style={{ background: `${statusColor(app.status)}10`, border: `1px solid ${statusColor(app.status)}30` }}
                  >
                    <div className="w-[4px] h-[4px] rounded-full" style={{ background: statusColor(app.status) }} />
                    <span className="font-ibm-mono text-[8px] tracking-[1px]" style={{ color: statusColor(app.status) }}>
                      {app.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{app.department}</span>
                  <div className="w-[1px] h-[10px] bg-[var(--c-border)]" />
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">APPLIED {app.appliedDate.toUpperCase()}</span>
                  <div className="w-[1px] h-[10px] bg-[var(--c-border)]" />
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">UPDATED {app.lastUpdate.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {app.overallScore > 0 && (
                  <div className="flex flex-col items-center gap-[1px] px-3 py-2 border border-[var(--c-accent)]/30 bg-[var(--c-accent)]/05">
                    <span className="font-grotesk text-[21px] font-bold text-[var(--c-accent)] leading-none">{app.overallScore}%</span>
                    <span className="font-ibm-mono text-[7px] text-[var(--c-text-muted)] tracking-[0.5px]">AI MATCH</span>
                  </div>
                )}
                <Link
                  href="/candidate/feedback"
                  className="px-3 h-[34px] flex items-center font-ibm-mono text-[8px] text-[var(--c-text-muted)] border border-[var(--c-border)] hover:text-[var(--c-accent)] hover:border-[var(--c-accent)]/40 transition-colors tracking-[1px] whitespace-nowrap"
                >
                  VIEW FEEDBACK /
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center w-full overflow-x-auto pb-1">
              {app.steps.map((step, i) => {
                const isActive = !step.done && (i === 0 || app.steps[i - 1].done);
                return (
                  <div key={step.label} className="flex items-center flex-1 min-w-[72px]">
                    <div className="flex flex-col items-center gap-[6px] flex-1">
                      <div
                        className="flex items-center justify-center w-[20px] h-[20px] shrink-0 transition-all"
                        style={{
                          background: step.done ? "var(--c-accent)" : "transparent",
                          border: isActive ? "2px solid var(--c-accent)" : step.done ? "2px solid var(--c-accent)" : "2px solid var(--c-border)",
                        }}
                      >
                        {step.done && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4l2 2 4-4" stroke="var(--c-text)" strokeWidth="1.4" strokeLinecap="square" />
                          </svg>
                        )}
                        {isActive && <div className="w-[6px] h-[6px] bg-[var(--c-accent)] animate-pulse" />}
                      </div>
                      <span
                        className="font-ibm-mono text-[7px] text-center tracking-[0.3px] whitespace-nowrap"
                        style={{ color: step.done ? "var(--c-accent)" : isActive ? "var(--c-accent)" : "var(--c-text-faint)" }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < app.steps.length - 1 && (
                      <div className="h-[2px] flex-1 mx-1 shrink-0" style={{ background: step.done ? "var(--c-accent)" : "var(--c-border-soft)" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current step note */}
            <div className="flex items-center gap-2 pt-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[var(--c-accent)] shrink-0">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 3v3M5 7.5v.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
              </svg>
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px]">
                Current stage: <span className="text-[var(--c-accent)]">{app.currentStep}</span>
                {app.id === "APP-001" && " — You have an exam waiting. "}
                {app.id === "APP-001" && (
                  <Link href="/candidate/exams" className="text-[var(--c-accent)] underline underline-offset-2 hover:no-underline">
                    Start now /
                  </Link>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
