"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";

const slides = [
  {
    tag: "[DASHBOARD]",
    tagBg: "var(--c-accent)",
    tagColor: "var(--c-text)",
    idx: "01 / 04",
    idxColor: "var(--c-text-dim)",
    title: "FORGE ANALYTICS\nDASHBOARD",
    by: "BY FORGE LAB // BUILT IN 3 DAYS WITH PIXELCRAFT",
    border: "var(--c-border)",
    bg: "var(--c-bg-soft)",
    tagBorder: "",
  },
  {
    tag: "[DESIGN SYS]",
    tagBg: "var(--c-bg-soft)",
    tagColor: "var(--c-accent)",
    idx: "02 / 04",
    idxColor: "var(--c-accent)",
    title: "AXIOM COMPONENT\nLIBRARY",
    by: "BY AXIOM INC // 200 COMPONENTS IN 1 WEEK",
    border: "var(--c-accent)",
    bg: "#0F0F0F",
    tagBorder: "var(--c-accent)",
  },
  {
    tag: "[MOBILE APP]",
    tagBg: "var(--c-bg-muted)",
    tagColor: "var(--c-warn)",
    idx: "03 / 04",
    idxColor: "var(--c-text-dim)",
    title: "NEXUS MOBILE\nSYSTEM",
    by: "BY NEXUS CO. // CROSS-PLATFORM, 4 DAYS",
    border: "var(--c-border)",
    bg: "var(--c-bg)",
    tagBorder: "var(--c-warn)",
  },
  {
    tag: "[LANDING PAGE]",
    tagBg: "var(--c-accent)",
    tagColor: "var(--c-text)",
    idx: "04 / 04",
    idxColor: "var(--c-text-dim)",
    title: "VORTEX MARKETING\nSITE",
    by: "BY VORTEX SYS // LAUNCH READY IN 2 DAYS",
    border: "var(--c-border)",
    bg: "var(--c-bg-soft)",
    tagBorder: "",
  },
];

export default function Showcase() {
  const [active, setActive] = useState(1);

  const prev = () => setActive((p) => Math.max(0, p - 1));
  const next = () => setActive((p) => Math.min(slides.length - 1, p + 1));

  const slide = slides[active];

  return (
      <section id="showcase" className="flex flex-col w-full bg-[#080808] pt-16 md:pt-[100px] pb-0 gap-8 md:gap-[48px]">
      {/* Header */}
      <div className="flex items-end justify-between px-6 md:px-[120px]">
        <SectionHeader
          label="[07] // SHOWCASE"
          title={"BUILT WITH\nPIXELCRAFT."}
          titleWidth="w-full max-w-[600px]"
        />
        <div className="flex items-center gap-[8px] shrink-0">
          <button
            onClick={prev}
            className="flex items-center justify-center w-[48px] h-[48px] bg-[var(--c-bg-soft)] border-2 border-[#3D3D3D] hover:border-[var(--c-text-sub)] transition-colors"
          >
            <span className="font-grotesk text-[19px] font-bold text-[var(--c-text-sub)]">&lt;</span>
          </button>
          <button
            onClick={next}
            className="flex items-center justify-center w-[48px] h-[48px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors"
          >
            <span className="font-grotesk text-[19px] font-bold text-[var(--c-text)]">&gt;</span>
          </button>
        </div>
      </div>

      {/* Mobile: single card */}
      <div className="md:hidden px-6">
        <div
          className="flex flex-col gap-5 p-6 border-2 w-full"
          style={{ backgroundColor: slide.bg, borderColor: slide.border }}
        >
          <div className="flex items-center justify-center h-[160px] bg-[var(--c-bg-muted)] border border-[var(--c-border)]">
            <span className="font-ibm-mono text-[12px] text-[var(--c-text-faint)] tracking-[2px]">[SCREENSHOT]</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div
              className="flex items-center justify-center h-[24px] px-[10px] border"
              style={{ backgroundColor: slide.tagBg, borderColor: slide.tagBorder || "transparent" }}
            >
              <span className="font-ibm-mono text-[10px] font-bold tracking-[1px]" style={{ color: slide.tagColor }}>
                {slide.tag}
              </span>
            </div>
            <span className="font-ibm-mono text-[12px] tracking-[2px]" style={{ color: slide.idxColor }}>
              {slide.idx}
            </span>
          </div>
          <h3 className="font-grotesk text-[21px] font-bold text-[var(--c-text)] tracking-[1px] leading-[1.2] whitespace-pre-line">
            {slide.title}
          </h3>
          <p className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[1px]">{slide.by}</p>
        </div>
      </div>

      {/* Desktop: carousel track */}
      <div className="hidden md:overflow-hidden h-[416px] md:block px-[120px]">
        <div
          className="flex gap-[2px] transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(calc(-${active} * (560px + 2px)))` }}
        >
        {slides.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-[24px] p-[40px] h-[412px] w-[560px] shrink-0 border-2"
            style={{ backgroundColor: s.bg, borderColor: s.border }}
          >
            <div className="flex items-center justify-center h-[200px] bg-[var(--c-bg-muted)] border border-[var(--c-border)]">
              <span className="font-ibm-mono text-[12px] text-[var(--c-text-faint)] tracking-[2px]">[SCREENSHOT]</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div
                className="flex items-center justify-center h-[24px] px-[10px] border"
                style={{ backgroundColor: s.tagBg, borderColor: s.tagBorder || "transparent" }}
              >
                <span className="font-ibm-mono text-[10px] font-bold tracking-[1px]" style={{ color: s.tagColor }}>
                  {s.tag}
                </span>
              </div>
              <span className="font-ibm-mono text-[12px] tracking-[2px]" style={{ color: s.idxColor }}>
                {s.idx}
              </span>
            </div>
            <h3 className="font-grotesk text-[21px] font-bold text-[var(--c-text)] tracking-[1px] leading-[1.2] whitespace-pre-line">
              {s.title}
            </h3>
            <p className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[1px]">{s.by}</p>
          </div>
        ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-[8px] px-6 md:px-[120px]">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="h-[4px] transition-all"
            style={{ width: i === active ? 32 : 8, backgroundColor: i === active ? "var(--c-accent)" : "var(--c-text-faint)" }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 md:px-[120px] pb-16 md:pb-[100px]">
        <span className="font-ibm-mono text-[12px] text-[var(--c-text-dim)] tracking-[2px]">
          SHOWING 0{active + 1} OF 04 PROJECTS
        </span>
        <span className="font-ibm-mono text-[12px] text-[var(--c-accent)] tracking-[2px] cursor-pointer hover:underline">
          VIEW ALL &gt;
        </span>
      </div>
    </section>
  );
}
