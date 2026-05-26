"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { XaiDownloadButton } from "@/components/XaiDownloadButton";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BackendApp {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  cvRelevanceScore: number | null;
  examScore: number | null;
  finalScore: number | null;
  hardFilterPassed: boolean | null;
  submittedAt: string;
  interviewDate: string | null;
  interviewTime: string | null;
  xaiReportUrl: string | null;
  decisionNotes: string | null;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  jobId: number;
  jobTitle: string;
  status: string;
  cvScore: number;
  examScore: number;
  finalScore: number;
  hardFilterPassed: boolean | null;
  submittedAt: string;
  xaiReportUrl: string | null;
  decisionNotes: string | null;
}

function matchColor(score: number) {
  if (score >= 85) return "var(--c-accent)";
  if (score >= 65) return "var(--c-accent-hover)";
  if (score >= 45) return "var(--c-text-sub)";
  return "var(--c-warn)";
}

function statusLabel(s: string) {
  return s.replace(/_/g, " ");
}

function statusColor(s: string) {
  switch (s) {
    case "SHORTLISTED":
    case "INTERVIEW_SCHEDULED":
    case "SELECTED":
      return "var(--c-accent)";
    case "EXAM_AUTHORIZED":
    case "EXAM_COMPLETED":
      return "var(--c-accent-hover)";
    case "SUBMITTED":
    case "AI_SCREENING":
      return "var(--c-text-sub)";
    case "REJECTED":
    case "HARD_FILTER_FAILED":
      return "var(--c-warn)";
    default:
      return "var(--c-text-muted)";
  }
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ candidate, onClose, onShortlist }: {
  candidate: Candidate;
  onClose: () => void;
  onShortlist: (id: number) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border)] w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border-soft)] sticky top-0 bg-[var(--c-bg-elev)] z-10">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)]" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">APPLICATION DETAIL</span>
            </div>
            <span className="font-grotesk text-[19px] font-bold text-[var(--c-text)] pl-[18px]">
              {candidate.name}
            </span>
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] pl-[18px]">{candidate.email} // APP-{candidate.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center text-[var(--c-text-dim)] hover:text-[var(--c-text)] transition-colors border border-[var(--c-border)]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "CV SCORE", value: candidate.cvScore },
              { label: "EXAM SCORE", value: candidate.examScore },
              { label: "FINAL SCORE", value: candidate.finalScore },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2 p-4 bg-[var(--c-bg)] border border-[var(--c-border-soft)]">
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{item.label}</span>
                <span className="font-grotesk text-[28px] font-bold leading-none" style={{ color: matchColor(item.value) }}>
                  {item.value > 0 ? `${Math.round(item.value)}%` : "—"}
                </span>
                {item.value > 0 && (
                  <div className="w-full h-[3px] bg-[var(--c-bg-muted)]">
                    <div className="h-full" style={{ width: `${item.value}%`, background: matchColor(item.value) }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">JOB</span>
              <span className="font-ibm-mono text-[11px] text-[var(--c-text)]">{candidate.jobTitle}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">STATUS</span>
              <span className="font-ibm-mono text-[11px]" style={{ color: statusColor(candidate.status) }}>
                {statusLabel(candidate.status)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">HARD FILTER</span>
              <span className="font-ibm-mono text-[11px]" style={{
                color: candidate.hardFilterPassed === null ? "var(--c-text-muted)"
                  : candidate.hardFilterPassed ? "var(--c-accent)" : "var(--c-warn)"
              }}>
                {candidate.hardFilterPassed === null ? "PENDING" : candidate.hardFilterPassed ? "PASSED" : "FAILED"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">SUBMITTED</span>
              <span className="font-ibm-mono text-[11px] text-[var(--c-text-muted)]">
                {new Date(candidate.submittedAt).toISOString().slice(0, 10)}
              </span>
            </div>
          </div>

          {/* Decision Notes */}
          {candidate.decisionNotes && (
            <div className="flex flex-col gap-1">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">DECISION NOTES</span>
              <span className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] leading-relaxed">
                {candidate.decisionNotes}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--c-border-soft)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
              Application #{candidate.id} — {candidate.jobTitle}
            </span>
            <div className="flex items-center gap-2">
              <XaiDownloadButton applicationId={candidate.id} />
              {candidate.status === "EXAM_COMPLETED" && (
                <button
                  onClick={() => { onShortlist(candidate.id); onClose(); }}
                  className="px-4 py-2 bg-[var(--c-accent)] font-ibm-mono text-[9px] font-bold text-[var(--c-text)] tracking-[1px] hover:bg-[var(--c-accent-hover)] transition-colors"
                >
                  SHORTLIST /
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await apiFetch<BackendApp[]>("/api/v1/recruiters/applications");
    if (error) { setError(error.message); setLoading(false); return; }
    setCandidates(
      (data ?? []).map((a) => ({
        id: a.id,
        name: a.candidateName,
        email: a.candidateEmail,
        jobId: a.jobId,
        jobTitle: a.jobTitle,
        status: a.status,
        cvScore: a.cvRelevanceScore ?? 0,
        examScore: a.examScore ?? 0,
        finalScore: a.finalScore ?? 0,
        hardFilterPassed: a.hardFilterPassed,
        submittedAt: a.submittedAt,
        xaiReportUrl: a.xaiReportUrl,
        decisionNotes: a.decisionNotes,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function shortlist(appId: number) {
    setActionMsg(null);
    const { error } = await apiFetch<{ shortlisted: number }>("/api/v1/applications/shortlist", {
      method: "POST",
      body: JSON.stringify({ applicationIds: [appId] }),
    });
    if (error) { setActionMsg(`Error: ${error.message}`); return; }
    setActionMsg("Candidate shortlisted successfully");
    setTimeout(() => setActionMsg(null), 3000);
    await load();
  }

  const statuses = ["ALL", ...Array.from(new Set(candidates.map((c) => c.status)))];

  const filtered = candidates.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {selected && <DetailModal candidate={selected} onClose={() => setSelected(null)} onShortlist={shortlist} />}

      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[03] // CANDIDATE POOL</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          Candidate Pool
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          All applications across your job postings — click a row for details
        </p>
      </div>

      {actionMsg && (
        <div className="mb-4 px-3 py-2 border border-[var(--c-accent)]/40 bg-[var(--c-accent)]/5">
          <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[1px]">{actionMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/5">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">{error}</span>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, job, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]"
          />
        </div>
        <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)] flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-3 font-ibm-mono text-[8px] tracking-[1px] transition-colors whitespace-nowrap"
              style={{ background: statusFilter === s ? "var(--c-accent)" : "var(--c-bg-elev)", color: statusFilter === s ? "var(--c-text)" : "var(--c-text-muted)" }}
            >
              {s === "ALL" ? "ALL" : statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
          {["ID", "NAME / JOB", "CV", "EXAM", "FINAL", "STATUS", "ACTIONS"].map((h) => (
            <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">LOADING...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">
              {candidates.length === 0 ? "NO APPLICATIONS YET" : "NO CANDIDATES MATCH THIS FILTER"}
            </span>
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors cursor-pointer"
              onClick={() => setSelected(c)}
            >
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{c.id}</span>
              <div className="flex flex-col gap-[2px] min-w-0">
                <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{c.name}</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{c.jobTitle}</span>
              </div>
              <span className="font-grotesk text-[14px] font-bold" style={{ color: matchColor(c.cvScore) }}>
                {c.cvScore > 0 ? `${Math.round(c.cvScore)}%` : "—"}
              </span>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">
                {c.examScore > 0 ? `${Math.round(c.examScore)}%` : "—"}
              </span>
              <span className="font-grotesk text-[14px] font-bold" style={{ color: matchColor(c.finalScore) }}>
                {c.finalScore > 0 ? `${Math.round(c.finalScore)}%` : "—"}
              </span>
              <span
                className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px] whitespace-nowrap"
                style={{ color: statusColor(c.status), background: `${statusColor(c.status)}14` }}
              >
                {statusLabel(c.status)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors whitespace-nowrap"
              >
                DETAIL /
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
          Showing {filtered.length} of {candidates.length} applications
        </span>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px]"
        >
          REFRESH /
        </button>
      </div>
    </div>
  );
}
