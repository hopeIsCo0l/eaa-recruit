import SectionHeader from "./SectionHeader";

export default function Bento() {
  return (
    <section className="flex flex-col w-full bg-[var(--c-bg-elev)] py-16 px-6 md:py-[100px] md:px-[120px] gap-10 md:gap-[48px]">
      <SectionHeader
        label="[05] // CAPABILITIES"
        title={"THE FULL STACK.\nIN ONE SYSTEM."}
        titleWidth="w-full max-w-[800px]"
      />

      <div className="flex flex-col w-full gap-[2px]">
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row w-full gap-[2px]">
          {/* Bento A — Yellow */}
          <div className="flex flex-col gap-5 p-8 md:p-[40px] md:h-[320px] bg-[var(--c-accent)] w-full md:flex-1">
            <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-bg-muted)] tracking-[2px]">[01]</span>
            <h3 className="font-grotesk text-[25px] md:text-[29px] font-bold text-[var(--c-text)] tracking-[-1px] leading-[1.1] whitespace-pre-line">
              {"REAL-TIME\nCOLLABORATION"}
            </h3>
            <p className="font-ibm-mono text-[13px] text-[var(--c-bg-muted)] tracking-[1px] leading-[1.6]">
              MULTIPLE BUILDERS. ONE CANVAS. ZERO CONFLICTS. LIVE CURSORS, LIVE EDITS.
            </p>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[var(--c-bg)] w-fit">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-accent)] tracking-[2px]">[LIVE]</span>
            </div>
          </div>

          {/* Bento B */}
          <div className="flex flex-col gap-5 p-8 md:p-[40px] md:h-[320px] bg-[var(--c-bg-soft)] border border-[var(--c-border)] w-full md:flex-1">
            <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-accent)] tracking-[2px]">[02]</span>
            <h3 className="font-grotesk text-[25px] md:text-[29px] font-bold text-[var(--c-text)] tracking-[-1px] leading-[1.1] whitespace-pre-line">
              {"VERSION\nCONTROL"}
            </h3>
            <p className="font-ibm-mono text-[13px] text-[#666666] tracking-[1px] leading-[1.6]">
              EVERY CHANGE TRACKED. ROLL BACK ANY STATE IN &lt; 1 SECOND. BRANCH YOUR DESIGNS.
            </p>
          </div>

          {/* Bento C */}
          <div className="flex flex-col gap-5 p-8 md:p-[40px] md:h-[320px] bg-[var(--c-bg)] border border-[var(--c-border)] w-full md:flex-1">
            <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-accent)] tracking-[2px]">[03]</span>
            <h3 className="font-grotesk text-[25px] md:text-[29px] font-bold text-[var(--c-text)] tracking-[-1px] leading-[1.1] whitespace-pre-line">
              {"PLUGIN\nECOSYSTEM"}
            </h3>
            <p className="font-ibm-mono text-[13px] text-[#666666] tracking-[1px] leading-[1.6]">
              500+ OFFICIAL PLUGINS. REST API. WEBHOOKS. INTEGRATE WITH YOUR ENTIRE STACK.
            </p>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[var(--c-bg-muted)] border border-[var(--c-warn)] w-fit">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-warn)] tracking-[2px]">[OPEN]</span>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col md:flex-row w-full gap-[2px]">
          {/* Bento D */}
          <div className="flex flex-col gap-5 p-8 md:p-[40px] md:h-[260px] bg-[var(--c-bg-soft)] border border-[var(--c-border)] w-full md:flex-1">
            <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-accent)] tracking-[2px]">[04]</span>
            <h3 className="font-grotesk text-[25px] md:text-[29px] font-bold text-[var(--c-text)] tracking-[-1px] leading-[1.1] whitespace-pre-line">
              {"EXPORT\nANYWHERE"}
            </h3>
            <p className="font-ibm-mono text-[13px] text-[#666666] tracking-[1px] leading-[1.6]">
              SVG // CSS // REACT // VUE // FLUTTER. ONE CLICK. ANY FORMAT.
            </p>
          </div>

          {/* Bento E */}
          <div className="flex flex-col gap-5 p-8 md:p-[40px] md:h-[260px] bg-[var(--c-bg-elev)] border-2 border-[var(--c-warn)] w-full md:flex-1">
            <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-warn)] tracking-[2px]">[05]</span>
            <h3 className="font-grotesk text-[25px] md:text-[29px] font-bold text-[var(--c-text)] tracking-[-1px] leading-[1.1] whitespace-pre-line">
              {"AI-POWERED\nSUGGESTIONS"}
            </h3>
            <p className="font-ibm-mono text-[13px] text-[#666666] tracking-[1px] leading-[1.6]">
              PIXEL-TRAINED MODEL. CONTEXT-AWARE COMPLETIONS. SHIP FASTER, THINK CLEARER.
            </p>
            <div className="flex items-center justify-center h-[28px] px-[12px] bg-[var(--c-bg-muted)] border border-[var(--c-warn)] w-fit">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-warn)] tracking-[2px]">[AI]</span>
            </div>
          </div>

          {/* Bento F */}
          <div className="flex flex-col gap-5 p-8 md:p-[40px] md:h-[260px] bg-[var(--c-bg)] border border-[var(--c-border)] w-full md:flex-1">
            <span className="font-ibm-mono text-[12px] font-bold text-[var(--c-accent)] tracking-[2px]">[06]</span>
            <h3 className="font-grotesk text-[25px] md:text-[29px] font-bold text-[var(--c-text)] tracking-[-1px] leading-[1.1] whitespace-pre-line">
              {"ANALYTICS\nDASHBOARD"}
            </h3>
            <p className="font-ibm-mono text-[13px] text-[#666666] tracking-[1px] leading-[1.6]">
              USAGE METRICS. COMPONENT ADOPTION. TEAM VELOCITY. ALL IN ONE PLACE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
