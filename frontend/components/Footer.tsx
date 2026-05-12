"use client";

import { useState } from "react";

const platformLinks = ["BROWSE JOBS", "REGISTER", "LOG IN", "CANDIDATE DASHBOARD"];
const companyLinks  = ["ABOUT EAA", "ETHIOPIAN AIRLINES", "AVIATION ACADEMY", "CAREERS"];
const legalLinks    = ["PRIVACY POLICY", "EEO STATEMENT", "DATA PROTECTION", "TERMS OF USE"];

function getLinkHref(link: string): string {
  switch (link) {
    case "BROWSE JOBS":
      return "/#jobs";
    case "REGISTER":
      return "/register";
    case "LOG IN":
      return "/login";
    case "CANDIDATE DASHBOARD":
      return "/candidate";
    default:
      return "#";
  }
}

export default function Footer() {
  const [lang, setLang] = useState<"EN" | "AM">("EN");

  return (
    <footer className="flex flex-col w-full bg-[var(--c-bg)]">
      {/* Top */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-[80px] px-6 md:px-[120px] py-12 md:py-[64px]">
        {/* Brand */}
        <div className="flex flex-col gap-6 md:w-[300px] md:shrink-0">
          <div className="flex items-center gap-[12px]">
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[var(--c-accent)] shrink-0">
              <span className="font-grotesk text-[12px] font-bold text-[var(--c-text)] tracking-[1px]">EAA</span>
            </div>
            <div className="flex flex-col leading-none gap-[2px]">
              <span className="font-grotesk text-[15px] font-bold text-[var(--c-text)] tracking-[2px]">
                EAA RECRUIT
              </span>
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1px]">
                ETHIOPIAN AVIATION ACADEMY
              </span>
            </div>
          </div>
          <p className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.7] max-w-[260px]">
            THE AI-POWERED RECRUITMENT PLATFORM FOR ETHIOPIAN AIRLINES AND THE
            ETHIOPIAN AVIATION ACADEMY. FAIR, FAST, AND TRANSPARENT.
          </p>

          {/* Language toggle */}
          <div className="flex flex-col gap-2">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)] tracking-[2px]">LANGUAGE</span>
            <div className="flex items-center border border-[var(--c-border)] w-fit">
              {(["EN", "AM"] as const).map((l, i) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="flex items-center justify-center h-[32px] px-[14px] transition-colors"
                  style={{
                    backgroundColor: lang === l ? "var(--c-accent)" : "var(--c-bg-soft)",
                    color:           lang === l ? "var(--c-text)" : "var(--c-text-muted)",
                    borderRight:     i === 0 ? "1px solid var(--c-border)" : "none",
                  }}
                >
                  <span className="font-ibm-mono text-[11px] font-bold tracking-[1.5px]">
                    {l === "EN" ? "ENGLISH" : "አማርኛ"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compliance badge */}
          <div className="flex items-center gap-[8px] py-2 px-3 border border-[var(--c-accent)]/30 bg-[var(--c-accent)]/05 w-fit">
            <div className="w-[5px] h-[5px] rounded-full bg-[var(--c-accent)] shrink-0" />
            <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[0.5px]">
              PROC. NO. 1329/2023 COMPLIANT
            </span>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 md:flex md:flex-1 gap-8 md:gap-[60px]">
          {[
            { heading: "PLATFORM",   links: platformLinks },
            { heading: "COMPANY",    links: companyLinks  },
            { heading: "LEGAL",      links: legalLinks    },
          ].map((col) => (
            <div key={col.heading} className="flex flex-col gap-4 md:gap-[20px]">
              <span className="font-grotesk text-[12px] font-bold text-[var(--c-text)] tracking-[2px]">
                {col.heading}
              </span>
              {col.links.map((link) => (
                <a
                  key={link}
                  href={getLinkHref(link)}
                  className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[0.5px] hover:text-[var(--c-text-sub)] transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-6 md:px-[120px] py-4 md:h-[56px] border-t border-t-[var(--c-border-soft)] gap-3 sm:gap-0">
        <span className="font-ibm-mono text-[11px] text-[var(--c-text-dim)] tracking-[0.5px]">
          &copy; 2025 ETHIOPIAN AVIATION ACADEMY. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-6 md:gap-[32px]">
          <a href="#" className="font-ibm-mono text-[11px] text-[var(--c-text-dim)] tracking-[0.5px] hover:text-[var(--c-text-sub)] transition-colors">
            PRIVACY POLICY
          </a>
          <a href="#" className="font-ibm-mono text-[11px] text-[var(--c-text-dim)] tracking-[0.5px] hover:text-[var(--c-text-sub)] transition-colors">
            EEO STATEMENT
          </a>
          <a href="mailto:support@eaarecruit.et" className="font-ibm-mono text-[11px] text-[var(--c-text-dim)] tracking-[0.5px] hover:text-[var(--c-text-sub)] transition-colors">
            CONTACT SUPPORT
          </a>
          <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-accent)] tracking-[1px]">
            V1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
