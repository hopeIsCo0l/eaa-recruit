"use client";

import GlitchText from "@/components/GlitchText";

export default function FinalCTA() {
  return (
    <section className="flex flex-col items-center w-full bg-[var(--c-bg)] py-16 px-6 md:p-[120px] gap-10 md:gap-[48px] border-t-2 border-t-[var(--c-accent)]">
      {/* Badge */}
      <div className="flex items-center justify-center gap-[8px] h-[32px] px-[16px] bg-[var(--c-accent)]/10 border-2 border-[var(--c-accent)]">
        <div className="w-[6px] h-[6px] rounded-full bg-[var(--c-accent)]" />
        <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-accent)] tracking-[2px]">
          <GlitchText text="[READY TO APPLY?]" speed={30} />
        </span>
      </div>

      {/* Title */}
      <h2 className="font-grotesk text-[45px] md:text-[81px] font-bold text-[var(--c-text)] tracking-[-2px] leading-none text-center w-full max-w-[1000px] whitespace-pre-line text-balance">
        <GlitchText text={"YOUR AVIATION\nCAREER STARTS HERE."} speed={40} delay={200} />
      </h2>

      {/* Subtitle */}
      <p className="font-ibm-mono text-[11px] md:text-[15px] text-[#666666] tracking-[1px] md:tracking-[2px] text-center text-pretty w-full max-w-[700px] px-2">
        <GlitchText text="JOIN THOUSANDS OF CANDIDATES ON THE ONLY AI-POWERED AVIATION RECRUITMENT PLATFORM IN ETHIOPIA." speed={20} delay={450} />
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-[16px] w-full sm:w-auto">
        <a
          href="/register"
          className="flex items-center justify-center w-full sm:w-[260px] h-[64px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
        >
          <span className="font-grotesk text-[14px] font-bold text-[var(--c-text)] tracking-[2px]">
            REGISTER — IT&apos;S FREE
          </span>
        </a>
        <a
          href="#jobs"
          className="flex items-center justify-center w-full sm:w-[220px] h-[64px] bg-[var(--c-bg)] border-2 border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="font-ibm-mono text-[13px] text-[#666666] tracking-[2px]">
            BROWSE JOBS &gt;
          </span>
        </a>
      </div>

      {/* Data sovereignty note */}
      <div className="flex items-center gap-[10px]">
        <div className="w-[6px] h-[6px] rounded-full bg-[var(--c-accent)]" />
        <span className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[1px]">
          YOUR DATA NEVER LEAVES ETHIOPIA
        </span>
        <div className="w-[4px] h-[4px] rounded-full bg-[var(--c-text-faint)]" />
        <span className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[1px]">
          PROCLAMATION NO. 1329/2023 COMPLIANT
        </span>
      </div>
    </section>
  );
}
