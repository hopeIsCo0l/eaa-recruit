"use client";

import { useState } from "react";

type JobStatus = "OPEN" | "CLOSED" | "DRAFT";

interface Job {
  id: string;
  title: string;
  department: string;
  status: JobStatus;
  posted: string;
  deadline: string;
  applicants: number;
  shortlisted: number;
  examReady: number;
  cutoff: number;
}

const MOCK_JOBS: Job[] = [
  { id: "R01", title: "First Officer (B737)",        department: "FLIGHT OPERATIONS",       status: "OPEN",   posted: "2026-04-01", deadline: "2026-05-01", applicants: 342, shortlisted: 87, examReady: 62, cutoff: 70 },
  { id: "R02", title: "Senior Flight Attendant",     department: "IN-FLIGHT SERVICES",      status: "OPEN",   posted: "2026-04-05", deadline: "2026-05-10", applicants: 519, shortlisted: 114, examReady: 98, cutoff: 65 },
  { id: "R03", title: "Aircraft Maintenance Tech.",  department: "MAINTENANCE & ENG.",      status: "OPEN",   posted: "2026-04-10", deadline: "2026-05-15", applicants: 221, shortlisted: 43, examReady: 37, cutoff: 72 },
  { id: "R04", title: "Ground Ops Coordinator",      department: "GROUND OPERATIONS",       status: "OPEN",   posted: "2026-04-12", deadline: "2026-05-20", applicants: 88,  shortlisted: 22, examReady: 18, cutoff: 60 },
  { id: "R05", title: "Safety & Quality Inspector",  department: "QUALITY ASSURANCE",       status: "OPEN",   posted: "2026-04-14", deadline: "2026-05-25", applicants: 64,  shortlisted: 11, examReady: 9,  cutoff: 75 },
  { id: "R06", title: "Cabin Crew Trainer",          department: "IN-FLIGHT SERVICES",      status: "CLOSED", posted: "2026-03-01", deadline: "2026-04-01", applicants: 289, shortlisted: 61, examReady: 61, cutoff: 68 },
  { id: "R07", title: "Avionics Engineer",           department: "MAINTENANCE & ENG.",      status: "DRAFT",  posted: "—",          deadline: "—",          applicants: 0,   shortlisted: 0,  examReady: 0,  cutoff: 80 },
  { id: "R08", title: "Cargo Ops Officer",           department: "CARGO OPERATIONS",        status: "DRAFT",  posted: "—",          deadline: "—",          applicants: 0,   shortlisted: 0,  examReady: 0,  cutoff: 65 },
];

const STATUS_STYLES: Record<JobStatus, { bg: string; text: string; dot: string }> = {
  OPEN:   { bg: "rgba(255,214,0,0.08)", text: "var(--c-accent)", dot: "var(--c-accent)" },
  CLOSED: { bg: "rgba(245,245,240,0.04)", text: "var(--c-text-dim)",  dot: "var(--c-text-faint)"   },
  DRAFT:  { bg: "rgba(255,107,53,0.08)", text: "var(--c-warn)", dot: "var(--c-warn)" },
};

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

function FunnelBar({ applicants, shortlisted, examReady }: { applicants: number; shortlisted: number; examReady: number }) {
  const max = applicants || 1;
  return (
    <div className="flex flex-col gap-[3px] w-full">
      {[
        { label: "APPLIED",     count: applicants,  color: "var(--c-border)" },
        { label: "SHORTLISTED", count: shortlisted, color: "var(--c-text-sub)"    },
        { label: "EXAM READY",  count: examReady,   color: "var(--c-accent)" },
      ].map(({ label, count, color }) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-full h-[4px] bg-[var(--c-bg-muted)] flex-1">
            <div className="h-full transition-all" style={{ width: `${(count / max) * 100}%`, background: color }} />
          </div>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] w-[28px] text-right shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [search, setSearch]             = useState("");
  const [expanded, setExpanded]         = useState<string | null>(null);

  const filtered = MOCK_JOBS.filter((j) => {
    const matchStatus = statusFilter === "ALL" || j.status === statusFilter;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openCount   = MOCK_JOBS.filter((j) => j.status === "OPEN").length;
  const closedCount = MOCK_JOBS.filter((j) => j.status === "CLOSED").length;
  const draftCount  = MOCK_JOBS.filter((j) => j.status === "DRAFT").length;
  const totalApps   = MOCK_JOBS.reduce((s, j) => s + j.applicants, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[03] // JOB OVERSIGHT</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Active Vacancies
          </h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Monitor all postings, funnel metrics, and cutoff scores
          </p>
        </div>
        <button className="flex items-center gap-[8px] h-[40px] px-5 bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors self-start">
          + NEW POSTING
        </button>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--c-border-soft)] mb-8">
        {[
          { label: "OPEN POSITIONS",   value: openCount,   color: "var(--c-accent)" },
          { label: "CLOSED POSITIONS", value: closedCount, color: "var(--c-text-dim)"    },
          { label: "DRAFTS",           value: draftCount,  color: "var(--c-warn)" },
          { label: "TOTAL APPLICANTS", value: totalApps,   color: "var(--c-text)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col gap-2 p-5 bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</span>
            <span className="font-grotesk text-[33px] font-bold leading-none" style={{ color }}>
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="SEARCH BY TITLE, DEPARTMENT, OR ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-[38px] bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] px-4 font-ibm-mono text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
        />
        <div className="flex gap-[2px]">
          {(["ALL", "OPEN", "CLOSED", "DRAFT"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="h-[38px] px-4 font-ibm-mono text-[9px] tracking-[1.5px] transition-colors border border-[var(--c-border-soft)]"
              style={{
                background: statusFilter === s ? "var(--c-accent)" : "var(--c-bg-elev)",
                color:      statusFilter === s ? "var(--c-text)" : "var(--c-text-muted)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Job list */}
      <SectionLabel>{`JOB POSTINGS — ${filtered.length} RECORDS`}</SectionLabel>
      <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
        {filtered.map((job) => {
          const st  = STATUS_STYLES[job.status];
          const isExp = expanded === job.id;
          return (
            <div key={job.id} className="bg-[var(--c-bg-elev)]">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[var(--c-bg)] transition-colors flex-wrap md:flex-nowrap"
                onClick={() => setExpanded(isExp ? null : job.id)}
              >
                {/* Role ID */}
                <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] w-[36px] shrink-0">{job.id}</span>

                {/* Title + dept */}
                <div className="flex flex-col gap-[2px] flex-1 min-w-[160px]">
                  <span className="font-grotesk text-[15px] font-bold text-[var(--c-text)]">{job.title}</span>
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px]">{job.department}</span>
                </div>

                {/* Status */}
                <div
                  className="flex items-center gap-[6px] px-3 py-[4px] shrink-0"
                  style={{ background: st.bg }}
                >
                  <div className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: st.dot }} />
                  <span className="font-ibm-mono text-[9px] tracking-[1px]" style={{ color: st.text }}>{job.status}</span>
                </div>

                {/* Funnel mini */}
                <div className="w-[120px] shrink-0 hidden md:block">
                  <FunnelBar applicants={job.applicants} shortlisted={job.shortlisted} examReady={job.examReady} />
                </div>

                {/* Dates */}
                <div className="flex flex-col gap-[2px] shrink-0 text-right hidden lg:flex">
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">DEADLINE</span>
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)]">{job.deadline}</span>
                </div>

                {/* Chevron */}
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  className="shrink-0 text-[var(--c-text-faint)] transition-transform"
                  style={{ transform: isExp ? "rotate(180deg)" : "none" }}
                >
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                </svg>
              </div>

              {/* Expanded detail */}
              {isExp && (
                <div className="px-5 py-5 border-t border-[var(--c-bg-muted)] bg-[var(--c-bg)]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: "TOTAL APPLIED",   value: job.applicants },
                      { label: "SHORTLISTED",      value: job.shortlisted },
                      { label: "EXAM READY",       value: job.examReady },
                      { label: "CUTOFF SCORE",     value: `${job.cutoff}%` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-1">
                        <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">{label}</span>
                        <span className="font-grotesk text-[23px] font-bold text-[var(--c-accent)] leading-none">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mb-5">
                    <p className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px] mb-2">APPLICATION FUNNEL</p>
                    <FunnelBar applicants={job.applicants} shortlisted={job.shortlisted} examReady={job.examReady} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="h-[34px] px-4 bg-[var(--c-accent)] font-ibm-mono text-[9px] font-bold text-[var(--c-text)] tracking-[1.5px] hover:bg-[var(--c-accent-hover)] transition-colors">
                      VIEW CANDIDATES
                    </button>
                    <button className="h-[34px] px-4 border border-[var(--c-border)] font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] tracking-[1.5px] transition-colors">
                      EDIT POSTING
                    </button>
                    {job.status === "OPEN" && (
                      <button className="h-[34px] px-4 border border-[#FF5050]/30 font-ibm-mono text-[9px] text-[#FF5050] hover:border-[#FF5050] tracking-[1.5px] transition-colors">
                        CLOSE ROLE
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-16 bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[11px] text-[var(--c-text-faint)] tracking-[1.5px]">NO JOBS MATCH THIS FILTER</span>
          </div>
        )}
      </div>
    </div>
  );
}
