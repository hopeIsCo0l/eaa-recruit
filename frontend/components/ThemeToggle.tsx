"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(getCurrentTheme());
  }, []);

  const nextTheme: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        setThemeState(nextTheme);
      }}
      className="fixed bottom-5 right-5 z-[100] flex h-[42px] items-center gap-2 border border-[var(--c-border)] bg-[var(--c-bg-elev)] px-3 transition-colors hover:border-[var(--c-accent)]"
      aria-label="Toggle theme"
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="font-ibm-mono text-[10px] tracking-[1px] text-[var(--c-text-muted)]">
        {theme === "light" ? "LIGHT" : "DARK"}
      </span>
      <span className="h-[12px] w-[1px] bg-[var(--c-border)]" />
      <span className="font-ibm-mono text-[10px] font-bold tracking-[1px] text-[var(--c-text)]">
        {theme === "light" ? "MOON" : "SUN"}
      </span>
    </button>
  );
}
