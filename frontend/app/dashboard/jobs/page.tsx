"use client";

import { useEffect, useState } from "react";
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

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  title: "",
  description: "",
  requiredDegree: "",
  minHeightCm: "165",
  minWeightKg: "55",
  openDate: todayPlus(0),
  closeDate: todayPlus(30),
  examDate: todayPlus(45),
};

function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[{index}]</span>
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

export default function JobsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await apiFetch<BackendJob[]>("/api/v1/jobs/mine");
    if (error) setListError(error.message);
    else { setJobs(data ?? []); setListError(null); }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const setField = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setErrorMsg(null);

    if (!form.title.trim() || !form.description.trim() || !form.requiredDegree.trim()) {
      setErrorMsg("Title, description, and required degree are mandatory.");
      return;
    }
    const minH = Number(form.minHeightCm);
    const minW = Number(form.minWeightKg);
    if (!Number.isFinite(minH) || minH <= 0 || !Number.isFinite(minW) || minW <= 0) {
      setErrorMsg("Min height and min weight must be positive numbers.");
      return;
    }
    if (form.closeDate < form.openDate) {
      setErrorMsg("Close date must be on/after open date.");
      return;
    }
    if (form.examDate < form.closeDate) {
      setErrorMsg("Exam date must be on/after close date.");
      return;
    }

    setSubmitting(true);
    const { error } = await apiFetch<{ id: number }>("/api/v1/jobs", {
      method: "POST",
      body: JSON.stringify({
        title:          form.title.trim(),
        description:    form.description.trim(),
        requiredDegree: form.requiredDegree.trim(),
        minHeightCm:    minH,
        minWeightKg:    minW,
        openDate:       form.openDate,
        closeDate:      form.closeDate,
        examDate:       form.examDate,
      }),
    });
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setSavedAt(Date.now());
    setForm(emptyForm);
    setShowCreate(false);
    fetchJobs();
    setTimeout(() => setSavedAt(null), 4000);
  };

  const statusColor = (s: string) =>
    s === "OPEN" || s === "EXAM_SCHEDULED" ? "var(--c-accent)" :
    s === "DRAFT" ? "var(--c-text-muted)" :
    "var(--c-warn)";

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[02] // MY JOB POSTINGS</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Job Postings
          </h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Create new postings and manage your existing ones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="font-ibm-mono text-[9px] text-[var(--c-accent)] tracking-[1px]">JOB CREATED /</span>
          )}
          <button
            onClick={() => { setShowCreate((v) => !v); setErrorMsg(null); }}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
          >
            <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px]">
              {showCreate ? "CANCEL /" : "+ NEW JOB"}
            </span>
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="border border-[var(--c-accent)]/30 bg-[var(--c-bg-elev)] p-6 mb-8">
          <SectionLabel index="A">JOB DETAILS</SectionLabel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">JOB TITLE *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Senior First Officer"
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">REQUIRED DEGREE *</label>
              <input
                type="text"
                value={form.requiredDegree}
                onChange={(e) => setField("requiredDegree", e.target.value)}
                placeholder="e.g. BSc Aeronautical Engineering"
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">MIN HEIGHT (CM) *</label>
                <input
                  type="number"
                  min={1}
                  value={form.minHeightCm}
                  onChange={(e) => setField("minHeightCm", e.target.value)}
                  className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">MIN WEIGHT (KG) *</label>
                <input
                  type="number"
                  min={1}
                  value={form.minWeightKg}
                  onChange={(e) => setField("minWeightKg", e.target.value)}
                  className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">JOB DESCRIPTION *</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Paste or type the full job description — the AI parses this to score candidate CVs."
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] resize-none transition-colors tracking-[0.5px] leading-relaxed"
              />
            </div>
          </div>

          <SectionLabel index="B">DATES</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {([
              ["openDate",  "OPEN DATE *"],
              ["closeDate", "CLOSE DATE *"],
              ["examDate",  "EXAM DATE *"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex flex-col gap-2">
                <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</label>
                <input
                  type="date"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
                />
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 px-3 py-2 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/08">
              <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[0.5px]">{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[var(--c-border-soft)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px]">
              Posting goes live on the open date. CVs are scored against the description.
            </span>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-6 py-3 font-ibm-mono text-[10px] font-bold tracking-[1.5px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--c-accent)] text-[var(--c-text)] hover:bg-[var(--c-accent-hover)]"
            >
              {submitting ? "PUBLISHING..." : "PUBLISH JOB /"}
            </button>
          </div>
        </div>
      )}

      <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
        <div className="p-5 border-b border-[var(--c-border-soft)]">
          <SectionLabel index="C">MY POSTINGS</SectionLabel>
        </div>
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)] items-center">
          {["ID", "TITLE / DEGREE", "STATUS", "CLOSES", "EXAM"].map((h) => (
            <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="px-5 py-6">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">LOADING...</span>
          </div>
        ) : listError ? (
          <div className="px-5 py-6">
            <span className="font-ibm-mono text-[9px] text-[var(--c-warn)] tracking-[1px]">ERROR: {listError}</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="px-5 py-8">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">
              NO POSTINGS YET — CLICK "+ NEW JOB" TO CREATE ONE
            </span>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors"
            >
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">JOB-{job.id}</span>
              <div className="flex flex-col gap-[2px] min-w-0">
                <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{job.title}</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{job.requiredDegree}</span>
              </div>
              <span
                className="font-ibm-mono text-[8px] px-2 py-[3px] tracking-[1px]"
                style={{ color: statusColor(job.status), background: `${statusColor(job.status)}14` }}
              >
                {job.status}
              </span>
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)]">
                {new Date(job.closeDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
              </span>
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)]">
                {new Date(job.examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
