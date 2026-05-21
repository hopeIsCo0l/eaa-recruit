"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TooltipStyle: React.CSSProperties = {
  background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 0,
  padding: "8px 12px", fontFamily: "var(--font-ibm-plex-mono), monospace",
  fontSize: "9px", color: "var(--c-text)", letterSpacing: "1px",
};

type Step = { label: string; done: boolean; active: boolean };
type Application = { id: string; role: string; department: string; appliedDate: string; status: string | null; steps: Step[] };
type Action = { priority: string; title: string; desc: string; href: string; cta: string };

// AI skill data stays representative until FastAPI extraction is live
const SKILLS = [
  { term: "B787 Type Rating",         weight: 97, category: "Certification" },
  { term: "Navigation Systems",       weight: 92, category: "Technical"     },
  { term: "ATPL License",             weight: 95, category: "Certification" },
  { term: "IFR Operations",           weight: 88, category: "Technical"     },
  { term: "Crew Resource Management", weight: 84, category: "Soft Skill"    },
  { term: "ICAO English L5",          weight: 91, category: "Certification" },
  { term: "Safety Management",        weight: 79, category: "Soft Skill"    },
  { term: "Meteorology",              weight: 75, category: "Technical"     },
];

const skillChartData = SKILLS.map((s) => ({
  name: s.term.split(" ").slice(0, 2).join(" "),
  value: s.weight,
  category: s.category,
}));

function categoryColor(cat: string) {
  if (cat === "Certification") return "var(--c-accent)";
  if (cat === "Technical")     return "var(--c-accent-hover)";
  return "var(--c-text-sub)";
}

export default function CandidateDashboard() {
  const [lang, setLang] = useState<"EN" | "AM">("EN");
  const [applications, setApplications] = useState<Application[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/candidate")
      .then((r) => r.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
        if (data.actions)      setActions(data.actions);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-8">

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[01] // MY DASHBOARD</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          {lang === "EN" ? "Application Control Center" : "የማመልከቻ መቆጣጠሪያ ማዕከል"}
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          {lang === "EN" ? "Real-time status of your applications and AI-parsed skill profile." : "የእርስዎ ማመልከቻዎች እና የ AI የተተነተነ ክህሎት መገለጫ ሁኔታ።"}
        </p>
      </div>

      {/* Action Required banners */}
      {actions.map((action) => (
        <div key={action.title} className="border border-[var(--c-accent)]/30 bg-[var(--c-accent)]/04 p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-[3px] h-[40px] bg-[var(--c-accent)]" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-ibm-mono text-[8px] text-[var(--c-accent)] bg-[var(--c-accent)]/10 px-2 py-[2px] tracking-[1px]">
                  {action.priority} PRIORITY
                </span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">ACTION REQUIRED</span>
              </div>
              <span className="font-grotesk text-[15px] font-bold text-[var(--c-text)]">{action.title}</span>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)]">{action.desc}</span>
            </div>
          </div>
          <div className="md:ml-auto shrink-0">
            <Link href={action.href}
              className="inline-flex items-center justify-center px-6 h-[40px] bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px] hover:bg-[var(--c-accent-hover)] transition-colors">
              {action.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Application Pulse */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">APPLICATION PULSE</span>
        </div>

        {loading ? (
          <div className="flex items-center px-5 py-8 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">LOADING...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">NO APPLICATIONS YET</span>
            <Link href="/candidate/jobs"
              className="font-ibm-mono text-[9px] text-[var(--c-accent)] hover:underline tracking-[1px]">
              BROWSE OPEN POSITIONS /
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
            {applications.map((app) => (
              <div key={app.id} className="bg-[var(--c-bg-elev)] px-5 py-5 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-[3px]">
                    <span className="font-grotesk text-[15px] font-bold text-[var(--c-text)]">{app.role}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{app.department}</span>
                      <div className="w-[1px] h-[10px] bg-[var(--c-border)]" />
                      <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">APPLIED {app.appliedDate.toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px] shrink-0">{app.id.slice(0, 8).toUpperCase()}</span>
                </div>

                {/* Timeline steps */}
                <div className="flex items-center w-full gap-0 overflow-x-auto">
                  {app.steps.map((step, i) => (
                    <div key={step.label} className="flex items-center flex-1 min-w-[80px]">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="flex items-center justify-center w-[22px] h-[22px] shrink-0 transition-all"
                          style={{
                            background: step.done ? "var(--c-accent)" : step.active ? "var(--c-accent)/10" : "#111",
                            border: step.active ? "2px solid var(--c-accent)" : step.done ? "2px solid var(--c-accent)" : "2px solid var(--c-border)",
                          }}>
                          {step.done && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1 4l2 2 4-4" stroke="var(--c-text)" strokeWidth="1.4" strokeLinecap="square" />
                            </svg>
                          )}
                          {step.active && <div className="w-[6px] h-[6px] bg-[var(--c-accent)] animate-pulse" />}
                        </div>
                        <span className="font-ibm-mono text-[7px] text-center tracking-[0.5px] whitespace-nowrap"
                          style={{ color: step.done ? "var(--c-accent)" : step.active ? "var(--c-accent)" : "var(--c-text-faint)" }}>
                          {step.label}
                        </span>
                      </div>
                      {i < app.steps.length - 1 && (
                        <div className="h-[2px] flex-1 mx-1 shrink-0"
                          style={{ background: step.done ? "var(--c-accent)" : "var(--c-border-soft)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Summary — representative until FastAPI CV extraction is live */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
          <div className="flex flex-col gap-[2px]">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">AI SKILL SUMMARY</span>
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[1px]">WHAT THE SYSTEM SEES IN YOUR PROFILE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--c-border-soft)]">
          <div className="bg-[var(--c-bg-elev)] p-5 flex flex-col gap-4">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">EXTRACTED TERMS</span>
            <div className="flex flex-wrap gap-[1px] bg-[var(--c-border-soft)]">
              {SKILLS.map((s) => (
                <div key={s.term} className="flex items-center gap-2 bg-[var(--c-bg-elev)] px-3 py-2">
                  <div className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: categoryColor(s.category) }} />
                  <span className="font-ibm-mono text-[9px] tracking-[0.5px]" style={{ color: categoryColor(s.category) }}>{s.term}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-2">
              {["Certification", "Technical", "Soft Skill"].map((cat) => (
                <div key={cat} className="flex items-center gap-[5px]">
                  <div className="w-[6px] h-[6px] rounded-full" style={{ background: categoryColor(cat) }} />
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{cat.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--c-bg-elev)] p-5 flex flex-col gap-4">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">TERM RELEVANCE WEIGHTS</span>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={skillChartData} layout="vertical" barSize={8} margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={100}
                  tick={{ fill: "var(--c-text-muted)", fontSize: 7, fontFamily: "var(--font-ibm-plex-mono)", letterSpacing: "0.5px" }}
                  axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TooltipStyle} cursor={{ fill: "rgba(255,214,0,0.04)" }} />
                <Bar dataKey="value" radius={0} name="RELEVANCE %">
                  {skillChartData.map((entry, i) => (
                    <Cell key={i} fill={categoryColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--c-border-soft)]">
        {[
          { label: "BROWSE JOBS",  href: "/candidate/jobs",     sub: "Find new openings" },
          { label: "VIEW EXAMS",   href: "/candidate/exams",    sub: `${actions.length} exam${actions.length !== 1 ? "s" : ""} pending` },
          { label: "MY FEEDBACK",  href: "/candidate/feedback", sub: "See your AI scores" },
          { label: "MY PROFILE",   href: "/candidate/profile",  sub: "Update skills cloud" },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="flex flex-col gap-2 p-5 bg-[var(--c-bg-elev)] hover:bg-[var(--c-bg)] transition-colors group">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] group-hover:text-[var(--c-accent)] tracking-[1.5px] transition-colors">
              {link.label} /
            </span>
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">{link.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
