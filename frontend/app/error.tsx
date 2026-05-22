"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)] px-6">
      <div className="max-w-[480px] w-full flex flex-col gap-6 text-center">
        <div>
          <p className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[2px] mb-2">[ERROR] // UNEXPECTED</p>
          <h1 className="font-grotesk text-[27px] font-bold text-[var(--c-text)] tracking-[-0.5px]">
            SOMETHING WENT WRONG
          </h1>
          <p className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1px] leading-[1.7] mt-3">
            THE PAGE COULD NOT BE RENDERED. THIS HAS BEEN LOGGED.
          </p>
          {error.digest && (
            <p className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px] mt-2">
              REF: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="h-[44px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors font-grotesk text-[12px] font-bold text-[var(--c-text)] tracking-[2px]"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="h-[44px] flex items-center justify-center border border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors font-ibm-mono text-[10px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1.5px]"
          >
            BACK HOME /
          </Link>
        </div>
      </div>
    </div>
  );
}
