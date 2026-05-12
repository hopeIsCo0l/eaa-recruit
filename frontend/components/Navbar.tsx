"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "FEATURES",   section: "features"   },
  { label: "HOW IT WORKS", section: "how-it-works" },
  { label: "JOBS",       section: "jobs"        },
  { label: "TRUST",      section: "trust"       },
  { label: "FAQ",        section: "faq"         },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive]     = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang]         = useState<"EN" | "AM">("EN");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.section).filter(Boolean);
    const obs: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-35% 0px -60% 0px" }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:       scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter:   scrolled ? "blur(14px)"          : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)"      : "none",
        borderBottom:     scrolled ? "1px solid #1E2A3A"   : "1px solid transparent",
      }}
    >
      <div className="flex items-center justify-between h-[60px] px-6 md:px-[48px] max-w-[1400px] mx-auto">

        {/* Logo */}
        <a href="/" className="flex items-center gap-[10px] shrink-0 group">
          <div className="flex items-center justify-center w-[32px] h-[32px] bg-[var(--c-accent)] shrink-0">
            <span className="font-grotesk text-[11px] font-bold text-[var(--c-text)] tracking-[1px]">EAA</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-grotesk text-[13px] font-bold text-[var(--c-text)] tracking-[2px]">EAA RECRUIT</span>
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] tracking-[1px]">ETHIOPIAN AVIATION ACADEMY</span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-[36px]">
          {links.map(({ label, section }) => {
            const isActive = active === section;
            return (
              <button
                key={label}
                onClick={() => scrollTo(section)}
                className="relative font-ibm-mono text-[11px] tracking-[1.5px] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                style={{ color: isActive ? "var(--c-accent)" : "#666" }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "var(--c-text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = isActive ? "var(--c-accent)" : "#666";
                }}
              >
                {label}
                <span
                  className="absolute left-0 -bottom-[3px] h-[1.5px] bg-[var(--c-accent)] transition-all duration-300"
                  style={{ width: isActive ? "100%" : "0%" }}
                />
              </button>
            );
          })}
        </nav>

        {/* Desktop CTAs + lang toggle */}
        <div className="hidden md:flex items-center gap-[14px]">
          {/* Language toggle */}
          <button
            onClick={() => setLang((l) => (l === "EN" ? "AM" : "EN"))}
            className="flex items-center gap-[6px] font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[1.5px] hover:text-[var(--c-text)] transition-colors border border-[var(--c-border)] px-[10px] py-[5px]"
          >
            <span style={{ color: lang === "EN" ? "var(--c-accent)" : "var(--c-text-muted)" }}>EN</span>
            <span className="text-[var(--c-text-faint)]">/</span>
            <span style={{ color: lang === "AM" ? "var(--c-accent)" : "var(--c-text-muted)" }}>አማ</span>
          </button>
          <a
            href="/login"
            className="font-ibm-mono text-[11px] text-[#666] tracking-[1.5px] hover:text-[var(--c-text)] transition-colors"
          >
            LOG IN
          </a>
          <a
            href="/register"
            className="font-grotesk text-[12px] font-bold text-[var(--c-text)] bg-[var(--c-accent)] tracking-[1.5px] px-[18px] py-[9px] hover:bg-[var(--c-accent-hover)] transition-colors"
          >
            REGISTER
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="block w-[20px] h-[1.5px] bg-[var(--c-bg)] transition-transform duration-200 origin-center"
            style={{ transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
          <span className="block w-[20px] h-[1.5px] bg-[var(--c-bg)] transition-opacity duration-200"
            style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-[20px] h-[1.5px] bg-[var(--c-bg)] transition-transform duration-200 origin-center"
            style={{ transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight:    menuOpen ? "500px" : "0px",
          background:   "rgba(10,10,10,0.97)",
          backdropFilter: "blur(14px)",
          borderBottom: menuOpen ? "1px solid #1E2A3A" : "none",
        }}
      >
        <nav className="flex flex-col px-6 py-5 gap-0">
          {links.map(({ label, section }) => {
            const isActive = active === section;
            return (
              <button
                key={label}
                onClick={() => { scrollTo(section); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full font-ibm-mono text-[13px] tracking-[2px] py-[14px] border-b border-[#141414] transition-colors bg-transparent border-x-0 border-t-0 cursor-pointer"
                style={{ color: isActive ? "var(--c-accent)" : "#666" }}
              >
                <span className="w-[4px] h-[4px] rounded-full shrink-0 transition-colors"
                  style={{ background: isActive ? "var(--c-accent)" : "var(--c-border)" }} />
                {label}
              </button>
            );
          })}
          <div className="flex flex-col gap-[10px] pt-5">
            <button
              onClick={() => setLang((l) => (l === "EN" ? "AM" : "EN"))}
              className="font-ibm-mono text-[13px] text-[var(--c-text-muted)] tracking-[1.5px] text-left"
            >
              LANGUAGE: <span className="text-[var(--c-accent)]">{lang === "EN" ? "ENGLISH" : "አማርኛ"}</span>
            </button>
            <a href="/login" className="font-ibm-mono text-[13px] text-[var(--c-text-muted)] tracking-[1.5px]">LOG IN</a>
            <a
              href="/register"
              className="font-grotesk text-[12px] font-bold text-[var(--c-text)] bg-[var(--c-accent)] tracking-[1.5px] px-[18px] py-[11px] text-center hover:bg-[var(--c-accent-hover)] transition-colors"
            >
              REGISTER NOW
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
