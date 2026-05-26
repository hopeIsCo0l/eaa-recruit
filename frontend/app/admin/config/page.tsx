"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// ─── Shared UI primitives ──────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

function ConfigBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)] flex flex-col gap-5">
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</label>
      {children}
      {hint && <p className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">{hint}</p>}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-[38px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
    />
  );
}

// ─── AI Models panel (wired) ──────────────────────────────────────────────

type AiModel = {
  id: number;
  modelVersion: string;
  description: string | null;
  active: boolean;
  activatedAt: string;
  createdAt: string;
};

function AiModelsPanel() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register form
  const [newVersion, setNewVersion] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Track which row is mid-activation for spinner
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiFetch<AiModel[]>("/api/v1/admin/ai-models");
    setLoading(false);
    if (error) { setError(error.message); return; }
    setModels(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newVersion.trim()) { setError("MODEL VERSION REQUIRED"); return; }
    setSubmitting(true);
    const { error } = await apiFetch<AiModel>("/api/v1/admin/ai-models", {
      method: "POST",
      body: JSON.stringify({
        modelVersion: newVersion.trim(),
        description: newDesc.trim() || undefined,
      }),
    });
    setSubmitting(false);
    if (error) { setError(error.message.toUpperCase()); return; }
    setNewVersion("");
    setNewDesc("");
    await load();
  }

  async function activate(id: number) {
    setError(null);
    setActivatingId(id);
    const { error } = await apiFetch<AiModel>(`/api/v1/admin/ai-models/${id}/activate`, {
      method: "POST",
    });
    setActivatingId(null);
    if (error) { setError(error.message.toUpperCase()); return; }
    await load();
  }

  return (
    <ConfigBlock>
      <form onSubmit={register} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="MODEL VERSION" hint="Unique identifier — e.g. v2.0.3-en">
            <TextInput value={newVersion} onChange={setNewVersion} placeholder="v2.0.3-en" />
          </Field>
          <Field label="DESCRIPTION (OPTIONAL)" hint="Free-text changelog or notes">
            <TextInput value={newDesc} onChange={setNewDesc} placeholder="Improved Amharic resume parsing" />
          </Field>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-[38px] px-5 bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors disabled:opacity-50 self-start"
        >
          {submitting ? "REGISTERING…" : "+ REGISTER VERSION"}
        </button>
      </form>

      {error && (
        <div className="px-3 py-2 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/5">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">{error}</span>
        </div>
      )}

      <div className="border-t border-[var(--c-border-soft)] pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">
            REGISTERED VERSIONS — {models.length}
          </span>
          <button
            onClick={load}
            className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1px]"
          >
            REFRESH
          </button>
        </div>

        {loading && models.length === 0 ? (
          <div className="py-6 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">
            LOADING…
          </div>
        ) : models.length === 0 ? (
          <div className="py-6 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[1.5px]">
            NO MODEL VERSIONS REGISTERED YET
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--c-border-soft)]">
                  {["ID", "VERSION", "DESCRIPTION", "STATUS", "CREATED", "ACTION"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--c-bg-muted)] hover:bg-[var(--c-bg)] transition-colors">
                    <td className="px-3 py-2 font-ibm-mono text-[9px] text-[var(--c-text-dim)]">{m.id}</td>
                    <td className="px-3 py-2 font-ibm-mono text-[11px] text-[var(--c-text)] font-bold">{m.modelVersion}</td>
                    <td className="px-3 py-2 font-ibm-mono text-[10px] text-[var(--c-text-sub)] max-w-[260px] truncate">{m.description ?? "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-[6px]">
                        <div
                          className="w-[5px] h-[5px] rounded-full shrink-0"
                          style={{ background: m.active ? "var(--c-accent)" : "var(--c-text-faint)" }}
                        />
                        <span
                          className="font-ibm-mono text-[9px] tracking-[1px]"
                          style={{ color: m.active ? "var(--c-accent)" : "var(--c-text-dim)" }}
                        >
                          {m.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-ibm-mono text-[9px] text-[var(--c-text-dim)]">
                      {new Date(m.createdAt).toISOString().slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="px-3 py-2">
                      {m.active ? (
                        <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">// CURRENT</span>
                      ) : (
                        <button
                          onClick={() => activate(m.id)}
                          disabled={activatingId === m.id}
                          className="font-ibm-mono text-[9px] text-[var(--c-accent)] hover:opacity-70 tracking-[1px] disabled:opacity-50"
                        >
                          {activatingId === m.id ? "ACTIVATING…" : "ACTIVATE"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ConfigBlock>
  );
}

// ─── System Health panel (wired) ───────────────────────────────────────────

type SystemHealth = {
  database: { up: boolean; activeConnections: number; idleConnections: number };
  redis: { up: boolean; info: string };
  uptimeSeconds: number;
};

function SystemHealthPanel() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await apiFetch<SystemHealth>("/api/v1/admin/system/health");
    if (error) { setError(error.message); return; }
    setError(null);
    setHealth(data ?? null);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  function fmtUptime(sec: number): string {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  }

  return (
    <ConfigBlock>
      {error && (
        <div className="px-3 py-2 border border-[var(--c-warn)]/40 bg-[var(--c-warn)]/5">
          <span className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[1px]">{error}</span>
        </div>
      )}
      {!health ? (
        <div className="py-4 text-center font-ibm-mono text-[10px] text-[var(--c-text-faint)]">LOADING HEALTH…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "DATABASE",
              up: health.database.up,
              detail: `${health.database.activeConnections} active / ${health.database.idleConnections} idle`,
            },
            {
              label: "REDIS",
              up: health.redis.up,
              detail: health.redis.info,
            },
            {
              label: "UPTIME",
              up: true,
              detail: fmtUptime(health.uptimeSeconds),
            },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-[var(--c-bg)] border border-[var(--c-border-soft)] flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ background: s.up ? "var(--c-accent)" : "var(--c-warn)" }}
                />
                <span className="font-ibm-mono text-[9px] tracking-[1.5px]" style={{ color: s.up ? "var(--c-accent)" : "var(--c-warn)" }}>
                  {s.label}
                </span>
              </div>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] truncate">{s.detail}</span>
            </div>
          ))}
        </div>
      )}
    </ConfigBlock>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ConfigPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[05] // CONFIGURATION</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          System Configuration
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          AI model registry and live system health (Super Admin only)
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <div>
          <SectionLabel>AI MODEL REGISTRY — FR-39</SectionLabel>
          <AiModelsPanel />
        </div>

        <div>
          <SectionLabel>SYSTEM HEALTH — FR-38</SectionLabel>
          <SystemHealthPanel />
        </div>

        <div>
          <SectionLabel>OTHER SETTINGS — MOCKUP</SectionLabel>
          <div className="p-5 border border-dashed border-[var(--c-border)] bg-[var(--c-bg-elev)]/40">
            <p className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[0.5px] leading-relaxed">
              NLP stopwords, scoring weights, exam timer, SMTP and SMS gateway sections
              are not yet wired to a backend service. They require a new
              <span className="text-[var(--c-accent)]"> ConfigService </span>
              endpoint with persistence. Tracked separately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
