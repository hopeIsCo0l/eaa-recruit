"use client";

import { useState } from "react";
import { apiDownload } from "@/lib/api";

/**
 * Triggers a browser download of the XAI feedback PDF for a given application.
 * Authenticated via the JWT cookie picked up by apiDownload.
 */
export function XaiDownloadButton({ applicationId, label = "DOWNLOAD XAI REPORT" }: {
  applicationId: number | string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const blob = await apiDownload(`/api/v1/applications/${applicationId}/xai-report`);
    setLoading(false);
    if (!blob) {
      setError("REPORT NOT AVAILABLE YET");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-${applicationId}-feedback.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="h-[40px] px-4 border border-[var(--c-accent)] bg-[var(--c-accent)]/06 hover:bg-[var(--c-accent)]/12 disabled:opacity-50 transition-colors font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[2px] flex items-center justify-center gap-2"
      >
        {loading && (
          <div className="w-[12px] h-[12px] border-2 border-[var(--c-accent)]/30 border-t-[var(--c-accent)] rounded-full animate-spin" />
        )}
        <span>{loading ? "PREPARING…" : label}</span>
      </button>
      {error && (
        <span className="font-ibm-mono text-[9px] text-red-400 tracking-[0.5px]">{error}</span>
      )}
    </div>
  );
}
