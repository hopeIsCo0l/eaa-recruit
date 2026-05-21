"use client";

import SectionHeader from "./SectionHeader";

interface JobCategoryCardProps {
  accentColor: string;
  title: string;
  openings: number;
  roles: string[];
  note: string;
}

function JobCategoryCard({
  accentColor,
  title,
  openings,
  roles,
  note,
}: JobCategoryCardProps) {
  return (
    <div
      className="flex flex-col gap-5 p-8 md:p-[40px] border-l-4 w-full md:flex-1 bg-[var(--c-bg-soft)]"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-grotesk text-[19px] font-bold text-[var(--c-text)] tracking-[0.5px] leading-[1.2]">
          {title}
        </h3>
        <div
          className="flex items-center justify-center shrink-0 h-[28px] px-[10px] border"
          style={{ borderColor: accentColor, background: `${accentColor}18` }}
        >
          <span className="font-ibm-mono text-[11px] font-bold tracking-[1.5px]" style={{ color: accentColor }}>
            {openings} OPEN
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-[8px]">
        {roles.map((role) => (
          <div key={role} className="flex items-center gap-[8px]">
            <div className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: accentColor }} />
            <span className="font-ibm-mono text-[12px] text-[var(--c-text-sub)] tracking-[0.5px]">{role}</span>
          </div>
        ))}
      </div>
      <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.5] mt-auto">
        {note}
      </p>
      <a
        href="/login"
        className="flex items-center justify-center h-[40px] border transition-colors"
        style={{ borderColor: accentColor }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${accentColor}18`)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <span className="font-grotesk text-[12px] font-bold tracking-[1.5px]" style={{ color: accentColor }}>
          BROWSE POSITIONS &gt;
        </span>
      </a>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="jobs" className="flex flex-col w-full bg-[var(--c-bg)] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <SectionHeader
          label="[04] // JOB DISCOVERY"
          title={"FIND YOUR\nROLE IN AVIATION."}
          subtitle="BROWSE OPENINGS ACROSS THREE CORE AVIATION DOMAINS."
        />
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center h-[40px] border border-[var(--c-border)] bg-[var(--c-bg-soft)] px-4 flex-1 md:w-[240px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mr-2">
              <circle cx="6" cy="6" r="4.5" stroke="var(--c-text-muted)" strokeWidth="1.2" />
              <path d="M9.5 9.5l2.5 2.5" stroke="var(--c-text-muted)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-ibm-mono text-[12px] text-[var(--c-text-dim)] tracking-[1px]">
              SEARCH JOBS...
            </span>
          </div>
          <button className="flex items-center justify-center h-[40px] w-[40px] bg-[var(--c-accent)] shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="var(--c-text)" strokeWidth="1.5" />
              <path d="M9.5 9.5l2.5 2.5" stroke="var(--c-text)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <JobCategoryCard
          accentColor="var(--c-accent)"
          title="Flight Operations"
          openings={12}
          roles={["Pilot Cadet (CPL Track)", "Flight Dispatcher", "Aviation Safety Officer", "Air Traffic Controller"]}
          note="REQUIRES VALID MEDICAL CERTIFICATE. AI EXAM COVERS METEOROLOGY, NAVIGATION, AND REGULATIONS."
        />
        <JobCategoryCard
          accentColor="#4ADE80"
          title="In-Flight Services"
          openings={28}
          roles={["Cabin Crew", "Purser", "In-Flight Safety Supervisor", "Catering Coordinator"]}
          note="MULTI-LANGUAGE CANDIDATES ENCOURAGED. EXAM ASSESSES SAFETY PROTOCOLS AND PASSENGER HANDLING."
        />
        <JobCategoryCard
          accentColor="#60A5FA"
          title="Maintenance & Engineering"
          openings={9}
          roles={["Aircraft Maintenance Technician", "Avionics Engineer", "Quality Assurance Inspector", "Ground Equipment Mechanic"]}
          note="EASA/FAA LICENSE HOLDERS PREFERRED. TECHNICAL EXAM COVERS SYSTEMS, NDT, AND AIRWORTHINESS."
        />
      </div>

      <div className="flex items-center gap-[10px] py-4 px-5 border border-[#1E2A1E] bg-[var(--c-bg-elev)]">
        <div className="w-[6px] h-[6px] rounded-full bg-[#4ADE80] shrink-0" />
        <span className="font-ibm-mono text-[12px] text-[#666666] tracking-[1px]">
          ALL POSITIONS FOLLOW A FAST-TRACK CYCLE — RESULTS WITHIN
        </span>
        <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-accent)] tracking-[1px]">
          4 WEEKS OF APPLICATION.
        </span>
      </div>
    </section>
  );
}
