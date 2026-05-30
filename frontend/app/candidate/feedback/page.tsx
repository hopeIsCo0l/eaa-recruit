"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Cell,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { XaiDownloadButton } from "@/components/XaiDownloadButton";

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  if (score >= 45) return "var(--c-text-sub)";
  return "var(--c-warn)";
}

type FeedbackReport = {
  applicationId:    number;
  jobTitle:         string;
  status:           string;
  cvRelevanceScore: number | null;
  examScore:        number | null;
  hardFilterPassed: boolean | null;
  finalScore:       number | null;
  xaiReportUrl:     string | null;
  xaiSummary:       string | null;
  decisionNotes:    string | null;
};

type AlignmentPair = {
  cvChunk:    string;
  jdChunk:    string;
  similarity: number;
};

type Explanation = {
  available:     boolean;
  strongMatches: AlignmentPair[];
  weakMatches:   AlignmentPair[];
  gaps:          string[];
};

type ApplicationSummary = {
  id:       number;
  jobTitle: string;
  status:   string;
};

function FeedbackPageInner() {
  const searchParams = useSearchParams();
  const paramId = searchParams.get("applicationId");

  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [selectedId, setSelectedId]     = useState<number | null>(paramId ? Number(paramId) : null);
  const [report, setReport]             = useState<FeedbackReport | null>(null);
  const [explanation, setExplanation]   = useState<Explanation | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [reasonOpen, setReasonOpen]     = useState(false);

  useEffect(() => {
    apiFetch<{ id: number; jobTitle: string; status: string }[]>("/api/v1/applications/me").then(
      ({ data }) => {
        if (!data) return;
        const decided = data.filter((a) =>
          ["SELECTED", "REJECTED", "WAITLISTED"].includes(a.status)
        );
        setApplications(decided);
        if (!selectedId && decided.length > 0) setSelectedId(decided[0].id);
      }
    );
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setExplanation(null);
    setReasonOpen(false);

    Promise.all([
      apiFetch<FeedbackReport>(`/api/v1/applications/${selectedId}/feedback`),
      apiFetch<Explanation>(`/api/v1/applications/${selectedId}/explanation`),
    ]).then(([feedbackRes, explanationRes]) => {
      setLoading(false);
      if (feedbackRes.error) { setError(feedbackRes.error.message); return; }
      if (feedbackRes.data)  setReport(feedbackRes.data);
      if (explanationRes.data) setExplanation(explanationRes.data);
    });
  }, [selectedId]);

  const cv    = report?.cvRelevanceScore != null ? report.cvRelevanceScore : 0;
  const exam  = report?.examScore        != null ? report.examScore        : 0;
  const final = report?.finalScore       != null ? report.finalScore       : 0;

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[05] // MY FEEDBACK</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Application Feedback
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Transparent XAI-powered results — see exactly why the system scored your application the way it did.
        </p>
      </div>

      {/* Application selector */}
      {applications.length > 0 && (
        <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)] flex-wrap">
          {applications.map((a) => (
            <button key={a.id} onClick={() => setSelectedId(a.id)}
              className="flex flex-col gap-[2px] px-5 py-3 text-left transition-all"
              style={{
                background:   selectedId === a.id ? "var(--c-accent)12" : "var(--c-bg-elev)",
                borderBottom: selectedId === a.id ? "2px solid var(--c-accent)" : "2px solid transparent",
              }}>
              <span className="font-ibm-mono text-[9px] tracking-[1px]"
                style={{ color: selectedId === a.id ? "var(--c-accent)" : "var(--c-text-muted)" }}>
                APP-{a.id}
              </span>
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)]">{a.jobTitle}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 border border-[var(--c-border-soft)]">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1px]">NO FEEDBACK AVAILABLE YET</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)]">Feedback is shown after a final decision has been recorded.</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 border border-[var(--c-border-soft)]">
          <div className="w-[40px] h-[40px] border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1px]">LOADING FEEDBACK…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-4 py-3 border border-[var(--c-warn)] bg-[var(--c-warn)]/05">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)]">{error}</span>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Status strip */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-[5px]"
              style={{ background: "var(--c-accent)10", border: "1px solid var(--c-accent)40" }}>
              <div className="w-[5px] h-[5px] rounded-full bg-[var(--c-accent)]" />
              <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px]">{report.status}</span>
            </div>
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">
              {report.jobTitle.toUpperCase()}
            </span>
          </div>

          {/* ── AI REASON TOGGLE ── */}
          {report.xaiSummary && (
            <div className="border border-[var(--c-border-soft)] overflow-hidden">
              <button
                onClick={() => setReasonOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[var(--c-bg-elev)] hover:bg-[var(--c-bg-muted)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">
                    AI ASSESSMENT REASON
                  </span>
                </div>
                <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)]">
                  {reasonOpen ? "▲ COLLAPSE" : "▼ EXPAND"}
                </span>
              </button>

              {reasonOpen && (
                <div className="px-5 py-4 bg-[var(--c-bg)] border-t border-[var(--c-border-soft)]">
                  <p className="font-ibm-mono text-[11px] text-[var(--c-text)] leading-[1.8] tracking-[0.3px]">
                    {report.xaiSummary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Score overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gauge */}
            <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] p-6 flex flex-col items-center gap-4">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[2px] self-start">OVERALL AI MATCH SCORE</span>
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <RadialBarChart cx={100} cy={100} innerRadius={60} outerRadius={88}
                    data={[{ value: final, fill: matchColor(final) }]} startAngle={220} endAngle={-40}>
                    <RadialBar dataKey="value" cornerRadius={0} background={{ fill: "var(--c-bg-muted)" }}>
                      <Cell fill={matchColor(final)} />
                    </RadialBar>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-grotesk text-[49px] font-bold leading-none" style={{ color: matchColor(final) }}>
                    {Math.round(final)}
                  </span>
                  <span className="font-ibm-mono text-[11px] text-[var(--c-text-dim)]">%</span>
                </div>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] p-6 flex flex-col justify-center gap-5">
              {[
                { label: "CV SIMILARITY (VECTOR MATCH)", value: cv,   weight: "40%" },
                { label: "TECHNICAL EXAM SCORE",          value: exam, weight: "40%" },
                { label: "ELIGIBILITY CHECK",             value: report.hardFilterPassed ? 100 : 0, weight: "20%" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[1px]">
                      <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] tracking-[1px]">{item.label}</span>
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)]">WEIGHT: {item.weight}</span>
                    </div>
                    <span className="font-grotesk text-[21px] font-bold" style={{ color: matchColor(item.value) }}>
                      {item.label === "ELIGIBILITY CHECK"
                        ? (report.hardFilterPassed ? "PASS" : "FAIL")
                        : `${Math.round(item.value)}%`}
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-[var(--c-bg-muted)]">
                    <div className="h-full transition-all" style={{ width: `${item.value}%`, background: matchColor(item.value) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic alignment */}
          {explanation?.available && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--c-border-soft)]">
              {/* Strengths */}
              <div className="bg-[var(--c-bg-elev)] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">STRONG MATCHES</span>
                </div>
                <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
                  {explanation.strongMatches.length === 0 && (
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] px-4 py-3">No strong matches found.</span>
                  )}
                  {explanation.strongMatches.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 bg-[var(--c-bg-elev)]">
                      <div className="flex items-center justify-center w-[16px] h-[16px] bg-[var(--c-accent)] shrink-0 mt-[1px]">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke="var(--c-text)" strokeWidth="1.4" strokeLinecap="square" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                        <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{m.jdChunk}</span>
                        <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] leading-relaxed line-clamp-2">{m.cvChunk}</span>
                        <span className="font-ibm-mono text-[8px]" style={{ color: matchColor(m.similarity * 100) }}>
                          {Math.round(m.similarity * 100)}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps + partial */}
              <div className="bg-[var(--c-bg-elev)] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-[14px] bg-[var(--c-warn)] shrink-0" />
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">GAPS</span>
                </div>
                <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
                  {explanation.gaps.length === 0 && (
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] px-4 py-3">No significant gaps detected.</span>
                  )}
                  {explanation.gaps.map((g, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 bg-[var(--c-bg-elev)]">
                      <div className="flex items-center justify-center w-[16px] h-[16px] border border-[var(--c-warn)]/50 shrink-0 mt-[1px]">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M4 2v3M4 6.5v.5" stroke="var(--c-warn)" strokeWidth="1.4" strokeLinecap="square" />
                        </svg>
                      </div>
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{g}</span>
                    </div>
                  ))}
                </div>

                {explanation.weakMatches.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-[3px] h-[14px] bg-[var(--c-text-sub)] shrink-0" />
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">PARTIAL MATCHES</span>
                    </div>
                    <div className="flex flex-col gap-[1px] bg-[var(--c-border-soft)]">
                      {explanation.weakMatches.map((m, i) => (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 bg-[var(--c-bg-elev)]">
                          <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                            <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{m.jdChunk}</span>
                            <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] line-clamp-2">{m.cvChunk}</span>
                            <span className="font-ibm-mono text-[8px] text-[var(--c-text-sub)]">{Math.round(m.similarity * 100)}% match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Explanation unavailable notice */}
          {explanation && !explanation.available && (
            <div className="px-4 py-3 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px]">
                SEMANTIC ALIGNMENT DATA UNAVAILABLE — chunk embeddings were not stored at submission time.
              </span>
            </div>
          )}

          {/* Recruiter notes */}
          {report.decisionNotes && (
            <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
                <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">RECRUITER NOTES</span>
              </div>
              <p className="font-ibm-mono text-[10px] text-[var(--c-text)] leading-relaxed">{report.decisionNotes}</p>
            </div>
          )}

          {/* Footer — export as secondary */}
          <div className="flex items-center justify-between border-t border-[var(--c-border-soft)] pt-4">
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">
              Generated by EAA XAI Engine — Proclamation 1329/2023 compliant. Scores are computed, not human-assigned.
            </span>
            {report.xaiReportUrl && (
              <XaiDownloadButton applicationId={report.applicationId} label="EXPORT PDF /" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={null}>
      <FeedbackPageInner />
    </Suspense>
  );
}
