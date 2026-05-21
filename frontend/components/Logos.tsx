const institutions = [
  { short: "ET", name: "ETHIOPIAN AIRLINES", sub: "Official Airline Partner" },
  { short: "EAA", name: "ETHIOPIAN AVIATION ACADEMY", sub: "Training Institution" },
  { short: "AAU", name: "ADDIS ABABA UNIVERSITY", sub: "Academic Partner" },
  { short: "ECAA", name: "ETHIOPIAN CIVIL AVIATION AUTH.", sub: "Regulatory Body" },
  { short: "MOT", name: "MINISTRY OF TRANSPORT", sub: "Government Sponsor" },
];

export default function Logos() {
  return (
    <section
      id="trust"
      className="flex flex-col items-center w-full bg-[var(--c-bg-elev)] py-[48px] px-6 md:py-[64px] md:px-[120px] gap-[40px] border-y border-y-[var(--c-border)]"
    >
      <div className="flex flex-col items-center gap-[8px]">
        <span className="font-ibm-mono text-[12px] text-[var(--c-text-dim)] tracking-[3px]">
          INSTITUTIONAL TRUST &amp; COMPLIANCE
        </span>
        <div className="flex items-center gap-[8px]">
          <div className="w-[6px] h-[6px] rounded-full bg-[var(--c-accent)]" />
          <span className="font-ibm-mono text-[11px] text-[var(--c-accent)] tracking-[1.5px]">
            ALL DATA STORED IN ETHIOPIA // PROCLAMATION NO. 1329/2023 COMPLIANT
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-[48px] w-full">
        {institutions.map((inst) => (
          <div
            key={inst.short}
            className="flex items-center gap-[10px] group"
          >
            <div className="flex items-center justify-center w-[44px] h-[44px] shrink-0 border border-[var(--c-border)] bg-[var(--c-bg-soft)] group-hover:border-[var(--c-accent)] transition-colors">
              <span className="font-grotesk text-[11px] font-bold text-[var(--c-accent)] tracking-[1px]">
                {inst.short}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-grotesk text-[12px] font-bold text-[var(--c-text-dim)] tracking-[1.5px] group-hover:text-[var(--c-text-sub)] transition-colors">
                {inst.name}
              </span>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[0.5px]">
                {inst.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
