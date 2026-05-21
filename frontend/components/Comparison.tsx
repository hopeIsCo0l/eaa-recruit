import SectionHeader from "./SectionHeader";

const rows = [
  { feature: "4PX GRID SYSTEM", pc: "[✓]", figma: "[—]", sketch: "[—]", framer: "[—]" },
  { feature: "DARK MODE FIRST", pc: "[✓]", figma: "[✓]", sketch: "[—]", framer: "[✓]" },
  { feature: "ZERO DEPENDENCIES", pc: "[✓]", figma: "[✗]", sketch: "[✗]", framer: "[✗]" },
  { feature: "AI SUGGESTIONS", pc: "[✓]", figma: "[BETA]", sketch: "[✗]", framer: "[✓]" },
  { feature: "VERSION HISTORY", pc: "[✓]", figma: "[✓]", sketch: "[✓]", framer: "[—]" },
  { feature: "FREE PLAN AVAILABLE", pc: "[✓]", figma: "[✓]", sketch: "[✗]", framer: "[✗]" },
];

function cellStyle(val: string) {
  if (val === "[✓]") return "font-bold text-[15px]";
  if (val === "[✗]") return "text-[#3D3D3D] text-[14px]";
  if (val === "[—]") return "text-[var(--c-text-dim)] text-[14px]";
  return "text-[var(--c-text-dim)] text-[11px]";
}

function cellColor(val: string) {
  if (val === "[✓]") return "text-[var(--c-text-dim)]";
  return "";
}

export default function Comparison() {
  return (
    <section id="comparison" className="flex flex-col w-full bg-[#050505] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[06] // VS. THE REST"
        title={"WHY PIXELCRAFT\nWINS."}
        subtitle="SEE HOW WE STACK UP AGAINST THE FIELD. NO SPIN. JUST PIXELS."
      />

      {/* Desktop table */}
      <div className="hidden md:flex flex-col w-full border border-[var(--c-border)]">
        {/* Header */}
        <div className="flex w-full h-[56px] bg-[var(--c-bg-soft)] border-b-2 border-b-[var(--c-accent)]">
          <div className="flex items-center w-[400px] shrink-0 px-[32px] border-r border-r-[var(--c-border)]">
            <span className="font-grotesk text-[12px] font-bold text-[var(--c-text-sub)] tracking-[2px]">FEATURE</span>
          </div>
          <div className="flex items-center flex-1 px-[32px] bg-[var(--c-bg-muted)] border-r border-r-[var(--c-border)]">
            <span className="font-grotesk text-[12px] font-bold text-[var(--c-accent)] tracking-[2px]">PIXELCRAFT</span>
          </div>
          {["FIGMA", "SKETCH", "FRAMER"].map((tool, i) => (
            <div key={tool} className={`flex items-center flex-1 px-[32px] ${i < 2 ? "border-r border-r-[var(--c-border)]" : ""}`}>
              <span className="font-grotesk text-[12px] font-bold text-[var(--c-text-muted)] tracking-[2px]">{tool}</span>
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((row, i) => (
          <div key={row.feature} className={`flex w-full h-[56px] ${i < rows.length - 1 ? "border-b border-b-[var(--c-border-soft)]" : ""}`}>
            <div className="flex items-center w-[400px] shrink-0 px-[32px] border-r border-r-[var(--c-border)]">
              <span className="font-ibm-mono text-[13px] text-[#CCCCCC] tracking-[1px]">{row.feature}</span>
            </div>
            <div className="flex items-center flex-1 px-[32px] bg-[var(--c-bg-elev)] border-r border-r-[var(--c-border)]">
              <span className="font-ibm-mono tracking-[1px] text-[var(--c-accent)] font-bold text-[15px]">{row.pc}</span>
            </div>
            {[row.figma, row.sketch, row.framer].map((val, j) => (
              <div key={j} className={`flex items-center flex-1 px-[32px] ${j < 2 ? "border-r border-r-[var(--c-border)]" : ""}`}>
                <span className={`font-ibm-mono tracking-[1px] ${cellStyle(val)} ${cellColor(val)}`}>{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Mobile: card-per-feature layout */}
      <div className="flex flex-col md:hidden w-full gap-[2px]">
        {/* Header row */}
        <div className="grid grid-cols-5 bg-[var(--c-bg-soft)] border border-[var(--c-accent)] border-b-2">
          <div className="col-span-2 px-3 py-3">
            <span className="font-grotesk text-[10px] font-bold text-[var(--c-text-sub)] tracking-[1px]">FEATURE</span>
          </div>
          <div className="px-2 py-3 bg-[var(--c-bg-muted)]">
            <span className="font-grotesk text-[10px] font-bold text-[var(--c-accent)] tracking-[1px]">PC</span>
          </div>
          <div className="px-2 py-3">
            <span className="font-grotesk text-[10px] font-bold text-[var(--c-text-muted)] tracking-[1px]">FIG</span>
          </div>
          <div className="px-2 py-3">
            <span className="font-grotesk text-[10px] font-bold text-[var(--c-text-muted)] tracking-[1px]">SKT</span>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-5 border border-[var(--c-border-soft)] ${i % 2 === 0 ? "bg-[var(--c-bg)]" : "bg-[var(--c-bg-elev)]"}`}>
            <div className="col-span-2 flex items-center px-3 py-4">
              <span className="font-ibm-mono text-[10px] text-[#CCCCCC] tracking-[1px] leading-[1.4]">{row.feature}</span>
            </div>
            <div className="flex items-center px-2 py-4 bg-[var(--c-bg-elev)]">
              <span className="font-ibm-mono text-[13px] text-[var(--c-accent)] font-bold">{row.pc}</span>
            </div>
            <div className="flex items-center px-2 py-4">
              <span className={`font-ibm-mono text-[12px] ${cellColor(row.figma)}`}>{row.figma}</span>
            </div>
            <div className="flex items-center px-2 py-4">
              <span className={`font-ibm-mono text-[12px] ${cellColor(row.sketch)}`}>{row.sketch}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
