"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type BackendJob = {
  id: number;
  title: string;
  description: string;
  minHeightCm: number;
  minWeightKg: number;
  requiredDegree: string;
  openDate: string;
  closeDate: string;
  examDate: string;
  status: string;
};

type UiJob = {
  id: number;
  title: string;
  department: string;
  description: string;
  requiredDegree: string;
  closeDate: string;
  status: string;
};

type UploadStage = "idle" | "uploading" | "done" | "error";

// ─── Smart CV Upload Modal ─────────────────────────────────────────────────────
function UploadModal({ job, onClose, onSubmitted }: { job: UiJob; onClose: () => void; onSubmitted: () => void }) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setFileName(f.name); }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setFileName(f.name); }
  };

  const submit = async () => {
    if (!file) return;
    setStage("uploading");
    setErrorMsg(null);

    const fd = new FormData();
    fd.append("jobId", String(job.id));
    fd.append("cv", file);

    const { error } = await apiFetch<{ id: number }>("/api/v1/applications", {
      method: "POST",
      body: fd,
    });

    if (error) {
      setStage("error");
      setErrorMsg(error.message || "Upload failed");
      return;
    }
    setStage("done");
    onSubmitted();
  };

  const progress: Record<UploadStage, number> = { idle: 0, uploading: 60, done: 100, error: 0 };
  const stageLabel: Record<UploadStage, string> = {
    idle: file ? "READY TO SUBMIT" : "WAITING FOR FILE",
    uploading: "UPLOADING CV TO SERVER...",
    done: "APPLICATION SUBMITTED — AI WILL SCORE SHORTLY",
    error: errorMsg ?? "UPLOAD FAILED",
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border)] w-full max-w-[560px]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border-soft)]">
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)]" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">SMART CV UPLOADER</span>
            </div>
            <span className="font-grotesk text-[17px] font-bold text-[var(--c-text)] pl-[18px]">{job.title}</span>
            <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] pl-[18px]">{job.department} // JOB-{job.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center text-[var(--c-text-dim)] hover:text-[var(--c-text)] border border-[var(--c-border)] transition-colors"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => stage === "idle" && inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 h-[160px] border-2 border-dashed transition-all cursor-pointer"
            style={{ borderColor: dragOver ? "var(--c-accent)" : "var(--c-border)", background: dragOver ? "var(--c-accent)08" : "#111" }}
          >
            <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
            {!fileName ? (
              <>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-[var(--c-text-dim)]">
                  <path d="M14 4v14M7 11l7-7 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
                  <path d="M4 22h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
                </svg>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1px]">DRAG & DROP YOUR CV HERE</span>
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">PDF / DOC / DOCX — MAX 10MB</span>
                </div>
                <button type="button" className="px-4 py-[6px] border border-[var(--c-border)] font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] tracking-[1px] transition-colors">
                  OR BROWSE FILES /
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="font-ibm-mono text-[9px] text-[var(--c-text)] tracking-[1px]">{fileName}</span>
                {stage === "uploading" && (
                  <div className="w-[28px] h-[28px] border-2 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin" />
                )}
                {stage === "done" && (
                  <div className="flex items-center justify-center w-[28px] h-[28px] bg-[var(--c-accent)]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="var(--c-text)" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                  </div>
                )}
                {stage === "error" && (
                  <span className="font-ibm-mono text-[9px] text-[var(--c-warn)] tracking-[1px]">RETRY OR PICK ANOTHER FILE</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1px]">{stageLabel[stage]}</span>
              <span className="font-ibm-mono text-[9px]" style={{ color: stage === "done" ? "var(--c-accent)" : stage === "error" ? "var(--c-warn)" : "var(--c-text-muted)" }}>
                {progress[stage]}%
              </span>
            </div>
            <div className="w-full h-[3px] bg-[var(--c-bg-muted)]">
              <div className="h-full transition-all duration-500"
                style={{ width: `${progress[stage]}%`, background: stage === "error" ? "var(--c-warn)" : "var(--c-accent)" }} />
            </div>
          </div>

          {stage === "done" ? (
            <Link
              href="/candidate/applications"
              className="w-full h-[48px] bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors flex items-center justify-center"
            >
              VIEW MY APPLICATIONS /
            </Link>
          ) : (
            <button
              onClick={submit}
              disabled={!file || stage === "uploading"}
              className="w-full h-[48px] bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {stage === "uploading" ? "UPLOADING..." : "SUBMIT APPLICATION /"}
            </button>
          )}

          <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">
            Your CV is processed on Ethiopian servers — Proclamation 1329/2023 compliant.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FindJobsPage() {
  const [jobs, setJobs] = useState<UiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("ALL");
  const [applying, setApplying] = useState<UiJob | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await apiFetch<BackendJob[]>("/api/v1/jobs");
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }
      setJobs((data ?? []).map((j) => ({
        id: j.id,
        title: j.title,
        department: j.requiredDegree || "—",
        description: j.description,
        requiredDegree: j.requiredDegree,
        closeDate: new Date(j.closeDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: j.status,
      })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const degrees = ["ALL", ...Array.from(new Set(jobs.map((j) => j.requiredDegree).filter(Boolean)))];

  const filtered = jobs.filter((j) => {
    const matchesDegree = degreeFilter === "ALL" || j.requiredDegree === degreeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      j.title.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q);
    return matchesDegree && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-8">
      {applying && (
        <UploadModal
          job={applying}
          onClose={() => setApplying(null)}
          onSubmitted={() => { /* keep modal open in done state */ }}
        />
      )}

      <div className="flex flex-col gap-1">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[02] // FIND JOBS</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">Job Listings</h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Open positions at Ethiopian Airlines and the Ethiopian Aviation Academy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
          </svg>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--c-bg-elev)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] pl-8 pr-4 py-3 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]"
          />
        </div>
        {degrees.length > 1 && (
          <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)] flex-wrap">
            {degrees.map((d) => (
              <button
                key={d}
                onClick={() => setDegreeFilter(d)}
                className="px-3 py-3 font-ibm-mono text-[8px] tracking-[1px] transition-colors whitespace-nowrap"
                style={{ background: degreeFilter === d ? "var(--c-accent)" : "var(--c-bg-elev)", color: degreeFilter === d ? "var(--c-text)" : "var(--c-text-muted)" }}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 border border-[var(--c-border-soft)]">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">LOADING...</span>
        </div>
      ) : loadError ? (
        <div className="flex items-center justify-center py-16 border border-[var(--c-warn)]/30 bg-[var(--c-warn)]/05">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">ERROR: {loadError}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--c-border-soft)]">
            {filtered.map((job) => (
              <div key={job.id} className="bg-[var(--c-bg-elev)] p-5 flex flex-col gap-4 hover:bg-[var(--c-bg)] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-[3px]">
                    <span className="font-grotesk text-[16px] font-bold text-[var(--c-text)]">{job.title}</span>
                    <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{job.requiredDegree}</span>
                  </div>
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-sub)] bg-[var(--c-bg)] px-2 py-[3px] tracking-[1px]">{job.status}</span>
                </div>

                <p className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] leading-relaxed tracking-[0.3px] line-clamp-4">
                  {job.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#111]">
                  <div className="flex flex-col gap-[1px]">
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">CLOSES</span>
                    <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)]">{job.closeDate}</span>
                  </div>
                  <button
                    onClick={() => setApplying(job)}
                    className="px-4 h-[34px] bg-[var(--c-accent)] font-ibm-mono text-[9px] font-bold text-[var(--c-text)] tracking-[1.5px] hover:bg-[var(--c-accent-hover)] transition-colors"
                  >
                    APPLY /
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16 border border-[var(--c-border-soft)]">
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1px]">
                {jobs.length === 0 ? "NO OPEN JOBS RIGHT NOW" : "NO JOBS MATCH YOUR SEARCH"}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
