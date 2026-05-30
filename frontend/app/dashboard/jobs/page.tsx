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

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[{index}]</span>
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

const STATUS_ORDER = ["DRAFT", "OPEN", "EXAM_SCHEDULED", "CLOSED", "ARCHIVED"];

function statusColor(s: string) {
  if (s === "OPEN" || s === "EXAM_SCHEDULED") return "var(--c-accent)";
  if (s === "DRAFT") return "var(--c-text-muted)";
  if (s === "CLOSED") return "var(--c-warn)";
  return "var(--c-text-dim)";
}

function statusActions(s: string): { action: string; label: string; color: string }[] {
  switch (s) {
    case "DRAFT":
      return [{ action: "publish", label: "PUBLISH", color: "var(--c-accent)" }];
    case "OPEN":
    case "EXAM_SCHEDULED":
      return [{ action: "close", label: "CLOSE", color: "var(--c-warn)" }];
    case "CLOSED":
      return [{ action: "archive", label: "ARCHIVE", color: "var(--c-text-dim)" }];
    default:
      return [];
  }
}

// ⚠️ Top-level component — was defined inside JobsPage which recreated it
// every render, killing input focus on every keystroke.
function JobFormFields({
  f,
  setF,
  err,
}: {
  f: typeof emptyForm;
  setF: <K extends keyof typeof emptyForm>(k: K, v: string) => void;
  err: string | null;
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">JOB TITLE *</label>
          <input type="text" value={f.title} onChange={(e) => setF("title", e.target.value)}
            placeholder="e.g. Senior First Officer"
            className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">REQUIRED DEGREE *</label>
          <input type="text" value={f.requiredDegree} onChange={(e) => setF("requiredDegree", e.target.value)}
            placeholder="e.g. BSc Aeronautical Engineering"
            className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] transition-colors tracking-[0.5px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">MIN HEIGHT (CM)</label>
            <input type="number" min={1} value={f.minHeightCm} onChange={(e) => setF("minHeightCm", e.target.value)}
              className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">MIN WEIGHT (KG)</label>
            <input type="number" min={1} value={f.minWeightKg} onChange={(e) => setF("minWeightKg", e.target.value)}
              className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]" />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">JOB DESCRIPTION *</label>
          <textarea rows={5} value={f.description} onChange={(e) => setF("description", e.target.value)}
            placeholder="Paste or type the full job description — the AI parses this to score candidate CVs."
            className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-text-faint)] resize-none transition-colors tracking-[0.5px] leading-relaxed" />
        </div>
      </div>

      <SectionLabel index="B">DATES</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {([["openDate", "OPEN DATE *"], ["closeDate", "CLOSE DATE *"], ["examDate", "EXAM DATE *"]] as const).map(
          ([key, label]) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</label>
              <input type="date" value={f[key]} onChange={(e) => setF(key, e.target.value)}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-3 py-2 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]" />
            </div>
          )
        )}
      </div>

      {err && (
        <div className="mb-4 px-3 py-2 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/08">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[0.5px]">{err}</span>
        </div>
      )}
    </>
  );
}

export default function JobsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Detail expand
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

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

  const setEditField = <K extends keyof typeof editForm>(k: K, v: string) =>
    setEditForm((f) => ({ ...f, [k]: v }));

  // ─── Create ─────────────────────────────────────────────────────────
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
    if (form.closeDate < form.openDate) { setErrorMsg("Close date must be on/after open date."); return; }
    if (form.examDate < form.closeDate) { setErrorMsg("Exam date must be on/after close date."); return; }

    setSubmitting(true);
    const { error } = await apiFetch<{ id: number }>("/api/v1/jobs", {
      method: "POST",
      body: JSON.stringify({
        title: form.title.trim(), description: form.description.trim(),
        requiredDegree: form.requiredDegree.trim(),
        minHeightCm: minH, minWeightKg: minW,
        openDate: form.openDate, closeDate: form.closeDate, examDate: form.examDate,
      }),
    });
    setSubmitting(false);
    if (error) { setErrorMsg(error.message); return; }
    showToast("Job created", true);
    setForm(emptyForm);
    setShowCreate(false);
    fetchJobs();
  };

  // ─── Edit ───────────────────────────────────────────────────────────
  const startEdit = (job: BackendJob) => {
    setEditingId(job.id);
    setEditForm({
      title: job.title,
      description: job.description,
      requiredDegree: job.requiredDegree,
      minHeightCm: String(job.minHeightCm),
      minWeightKg: String(job.minWeightKg),
      openDate: job.openDate,
      closeDate: job.closeDate,
      examDate: job.examDate,
    });
    setEditError(null);
    setExpandedId(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditError(null); };

  const handleUpdate = async () => {
    if (!editingId) return;
    setEditError(null);
    if (!editForm.title.trim() || !editForm.description.trim() || !editForm.requiredDegree.trim()) {
      setEditError("Title, description, and required degree are mandatory.");
      return;
    }

    setEditSubmitting(true);
    const { error } = await apiFetch<BackendJob>(`/api/v1/jobs/${editingId}`, {
      method: "PUT",
      body: JSON.stringify({
        title: editForm.title.trim(), description: editForm.description.trim(),
        requiredDegree: editForm.requiredDegree.trim(),
        minHeightCm: Number(editForm.minHeightCm), minWeightKg: Number(editForm.minWeightKg),
        openDate: editForm.openDate, closeDate: editForm.closeDate, examDate: editForm.examDate,
      }),
    });
    setEditSubmitting(false);
    if (error) { setEditError(error.message); return; }
    showToast("Job updated", true);
    setEditingId(null);
    fetchJobs();
  };

  // ─── Status change ──────────────────────────────────────────────────
  const handleStatusChange = async (jobId: number, action: string) => {
    const { error } = await apiFetch<BackendJob>(`/api/v1/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    if (error) { showToast(error.message, false); return; }
    showToast(`Job ${action}ed`, true);
    fetchJobs();
  };

  // JobFormFields moved OUTSIDE component (see top of file) to avoid focus-loss on every keystroke.

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 border font-ibm-mono text-[10px] tracking-[1px]"
          style={{ background: "var(--c-bg-elev)", borderColor: toast.ok ? "var(--c-accent)" : "var(--c-warn)", color: toast.ok ? "var(--c-accent)" : "var(--c-warn)" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[02] // MY JOB POSTINGS</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
            Job Postings
          </h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Create, edit, and manage your job postings
          </p>
        </div>
        <button
          onClick={() => { setShowCreate((v) => !v); setErrorMsg(null); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-3 bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
        >
          <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[1.5px]">
            {showCreate ? "CANCEL /" : "+ NEW JOB"}
          </span>
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="border border-[var(--c-accent)]/30 bg-[var(--c-bg-elev)] p-6 mb-8">
          <SectionLabel index="A">NEW JOB DETAILS</SectionLabel>
          <JobFormFields f={form} setF={setField} err={errorMsg} />
          <div className="flex items-center justify-between pt-4 border-t border-[var(--c-border-soft)]">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px]">
              Posting goes live on the open date. CVs are scored against the description.
            </span>
            <button onClick={handleSave} disabled={submitting}
              className="px-6 py-3 font-ibm-mono text-[10px] font-bold tracking-[1.5px] transition-colors disabled:opacity-40 bg-[var(--c-accent)] text-[var(--c-text)] hover:bg-[var(--c-accent-hover)]">
              {submitting ? "PUBLISHING..." : "PUBLISH JOB /"}
            </button>
          </div>
        </div>
      )}

      {/* Job list */}
      <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
        <div className="p-5 border-b border-[var(--c-border-soft)]">
          <SectionLabel index="C">MY POSTINGS</SectionLabel>
        </div>

        {/* Table header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)]">
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px] shrink-0 w-[50px]">ID</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px] flex-1 min-w-0">TITLE / DEGREE</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px] shrink-0">STATUS</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px] shrink-0 hidden lg:block">CLOSES</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px] shrink-0 hidden lg:block">EXAM</span>
          <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px] shrink-0">ACTIONS</span>
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
              NO POSTINGS YET — CLICK &quot;+ NEW JOB&quot; TO CREATE ONE
            </span>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id}>
              {/* Row */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#111] hover:bg-[var(--c-bg)] transition-colors">
                <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px] shrink-0 w-[50px]">JOB-{job.id}</span>

                <div className="flex flex-col gap-[2px] min-w-0 flex-1 max-w-[400px] cursor-pointer" onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}>
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate hover:text-[var(--c-accent)] transition-colors">
                    {job.title}
                  </span>
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{job.requiredDegree}</span>
                </div>

                <span className="font-ibm-mono text-[10px] px-2 py-1 tracking-[1px] shrink-0 font-bold"
                  style={{ color: statusColor(job.status), background: `${statusColor(job.status)}18`, border: `1px solid ${statusColor(job.status)}30` }}>
                  {job.status}
                </span>

                <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] shrink-0 hidden lg:block">
                  {new Date(job.closeDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </span>

                <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] shrink-0 hidden lg:block">
                  {new Date(job.examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {job.status !== "ARCHIVED" && (
                    <button
                      onClick={() => startEdit(job)}
                      className="font-ibm-mono text-[11px] text-[var(--c-text)] hover:text-[var(--c-accent)] tracking-[1px] px-3 py-1.5 border border-[var(--c-border-soft)] hover:border-[var(--c-accent)] transition-colors"
                    >
                      EDIT
                    </button>
                  )}
                  {statusActions(job.status).map((sa) => (
                    <button
                      key={sa.action}
                      onClick={() => handleStatusChange(job.id, sa.action)}
                      className="font-ibm-mono text-[11px] tracking-[1px] px-3 py-1.5 border transition-colors font-bold"
                      style={{ color: sa.color, borderColor: sa.color }}
                    >
                      {sa.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                    className="font-ibm-mono text-[12px] text-[var(--c-text-sub)] hover:text-[var(--c-text)] tracking-[1px] px-2"
                  >
                    {expandedId === job.id ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === job.id && editingId !== job.id && (
                <div className="px-5 py-4 bg-[var(--c-bg)] border-b border-[#111]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">OPEN DATE</span>
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{job.openDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">CLOSE DATE</span>
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{job.closeDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">EXAM DATE</span>
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{job.examDate}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">MIN HEIGHT</span>
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{job.minHeightCm} cm</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">MIN WEIGHT</span>
                      <span className="font-ibm-mono text-[10px] text-[var(--c-text)]">{job.minWeightKg} kg</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1px]">DESCRIPTION</span>
                    <p className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {job.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Inline edit form */}
              {editingId === job.id && (
                <div className="px-5 py-6 bg-[var(--c-bg)] border-b border-[var(--c-accent)]/30">
                  <div className="flex items-center justify-between mb-4">
                    <SectionLabel index="E">EDITING JOB-{job.id}</SectionLabel>
                    <button onClick={cancelEdit}
                      className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-warn)] tracking-[1px]">
                      CANCEL /
                    </button>
                  </div>
                  <JobFormFields f={editForm} setF={setEditField} err={editError} />
                  <div className="flex justify-end pt-4 border-t border-[var(--c-border-soft)]">
                    <button onClick={handleUpdate} disabled={editSubmitting}
                      className="px-6 py-3 font-ibm-mono text-[10px] font-bold tracking-[1.5px] transition-colors disabled:opacity-40 bg-[var(--c-accent)] text-[var(--c-text)] hover:bg-[var(--c-accent-hover)]">
                      {editSubmitting ? "SAVING..." : "SAVE CHANGES /"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between mt-4">
        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px]">
          {jobs.length} posting(s) — {jobs.filter((j) => j.status === "OPEN").length} open
        </span>
        <button onClick={fetchJobs}
          className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px]">
          REFRESH /
        </button>
      </div>
    </div>
  );
}
