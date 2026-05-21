"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlitchText from "@/components/GlitchText";
import { authClient } from "@/lib/auth-client";

const LANG = {
  en: {
    title: "SIGN IN TO YOUR ACCOUNT",
    subtitle: "EAA RECRUIT // ETHIOPIAN AVIATION ACADEMY",
    email: "EMAIL ADDRESS",
    password: "PASSWORD",
    forgot: "FORGOT PASSWORD?",
    submit: "SIGN IN",
    noAccount: "DON'T HAVE AN ACCOUNT?",
    register: "REGISTER AS CANDIDATE",
    roles: "ROLE IS DETECTED AUTOMATICALLY FROM YOUR ACCOUNT.",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••••••",
    errorMsg: "INVALID CREDENTIALS. PLEASE TRY AGAIN.",
  },
  am: {
    title: "ወደ መለያዎ ይግቡ",
    subtitle: "EAA RECRUIT // የኢትዮጵያ አቪዬሽን አካዳሚ",
    email: "ኢሜይል አድራሻ",
    password: "የምስጢር ቃል",
    forgot: "የምስጢር ቃልዎን ረሱ?",
    submit: "ግባ",
    noAccount: "መለያ የለዎትም?",
    register: "እንደ ተወዳዳሪ ይመዝገቡ",
    roles: "ሚናዎ ከመለያዎ ራስ-በራስ ይታወቃል።",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••••••",
    errorMsg: "ያልተፈቀደ። እባክዎ እንደገና ሞክሩ።",
  },
};

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  recruiter: "/dashboard",
  candidate: "/candidate",
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "am">("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const t = LANG[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (signInError || !data) {
      setError(true);
      return;
    }

    const role = (data.user as { role?: string }).role ?? "candidate";
    router.push(ROLE_HOME[role] ?? "/candidate");
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[var(--c-bg)] overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,214,0,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 border-r border-[var(--c-border-soft)] px-12 py-12 relative z-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-[36px] h-[36px] bg-[var(--c-accent)]">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-text)] tracking-[1px]">EAA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-text)] tracking-[2px]">EAA RECRUIT</span>
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)] tracking-[1px]">ETHIOPIAN AVIATION ACADEMY</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-grotesk text-[41px] font-bold text-[var(--c-text)] leading-[1.05] tracking-[-1px] text-balance">
              <GlitchText text="HIRE THE" speed={40} delay={100} />
              <br />
              <span className="text-[var(--c-accent)]">
                <GlitchText text="FUTURE OF" speed={40} delay={300} />
              </span>
              <br />
              <GlitchText text="AVIATION." speed={40} delay={500} />
            </h2>
            <p className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[1px] leading-[1.7] mt-6 max-w-[280px]">
              AN AI-POWERED RECRUITMENT SYSTEM FOR ETHIOPIAN AIRLINES AND THE ETHIOPIAN AVIATION ACADEMY.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {[
              { label: "AI CV PARSING", desc: "Semantic extraction from any format" },
              { label: "XAI SCORING", desc: "Transparent, explainable decisions" },
              { label: "< 4 WEEK CYCLE", desc: "From apply to offer" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-[5px] h-[5px] bg-[var(--c-accent)] mt-[5px] shrink-0" />
                <div>
                  <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-accent)] tracking-[1.5px] block">{item.label}</span>
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px]">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px] leading-[1.8]">
          COMPLIANT WITH PROCLAMATION NO. 1329/2023<br />
          DATA STAYS IN ETHIOPIA // ALL RIGHTS RESERVED
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="flex items-center justify-center w-[32px] h-[32px] bg-[var(--c-accent)]">
              <span className="font-ibm-mono text-[10px] font-bold text-[var(--c-text)]">EAA</span>
            </div>
            <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-text)] tracking-[2px]">EAA RECRUIT</span>
          </div>

          {/* Lang toggle */}
          <div className="flex items-center gap-0 w-fit border border-[var(--c-border)]">
            {(["en", "am"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-[6px] font-ibm-mono text-[10px] tracking-[1.5px] transition-colors ${
                  lang === l
                    ? "bg-[var(--c-accent)] text-[var(--c-text)] font-bold"
                    : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
                }`}
              >
                {l === "en" ? "EN" : "አማ"}
              </button>
            ))}
          </div>

          {/* Header */}
          <div>
            <p className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[2px] mb-2">[AUTH] // LOGIN</p>
            <h1 className="font-grotesk text-[27px] font-bold text-[var(--c-text)] tracking-[-0.5px] text-balance">{t.title}</h1>
            <p className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1.5px] mt-1">{t.subtitle}</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/40">
              <div className="w-[5px] h-[5px] bg-red-400 shrink-0" />
              <span className="font-ibm-mono text-[10px] text-red-400 tracking-[1px]">{t.errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-ibm-mono text-[10px] text-[#666] tracking-[1.5px]">{t.email}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="h-[48px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] px-4 font-ibm-mono text-[13px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-ibm-mono text-[10px] text-[#666] tracking-[1.5px]">{t.password}</label>
                <Link href="/forgot-password" className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors">
                  {t.forgot}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full h-[48px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] px-4 pr-12 font-ibm-mono text-[13px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)] hover:text-[var(--c-accent)] transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    {showPassword ? (
                      <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z M7 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M2 2l10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                    ) : (
                      <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z M7 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[52px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-[16px] h-[16px] border-2 border-[var(--c-text)]/30 border-t-[var(--c-text)] rounded-full animate-spin" />
              ) : null}
              <span className="font-grotesk text-[13px] font-bold text-[var(--c-text)] tracking-[2px]">{t.submit}</span>
            </button>
          </form>

          {/* Role detection note */}
          <div className="flex items-start gap-2 px-3 py-3 bg-[var(--c-accent)]/04 border border-[var(--c-accent)]/15">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--c-accent)] mt-[1px] shrink-0">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 5v4M6 3.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
            </svg>
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.7]">{t.roles}</span>
          </div>

          {/* Register link */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[var(--c-border-soft)]" />
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">{t.noAccount}</span>
            <div className="flex-1 h-[1px] bg-[var(--c-border-soft)]" />
          </div>
          <Link
            href="/register"
            className="flex items-center justify-center h-[48px] border-2 border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors"
          >
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] hover:text-[var(--c-accent)] tracking-[1.5px] transition-colors">{t.register}</span>
          </Link>

        </div>
      </div>
    </div>
  );
}
