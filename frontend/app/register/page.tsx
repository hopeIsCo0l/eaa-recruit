"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Field = { value: string; error: string; touched: boolean };
const field = (value = ""): Field => ({ value, error: "", touched: false });

// ⚠️ Defined OUTSIDE RegisterPage. Inline definition was recreating component
// every render → input lost focus on every keystroke.
type InputFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  rightEl?: React.ReactNode;
};

function InputField({ label, value, onChange, type = "text", placeholder, error, touched, rightEl }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-ibm-mono text-[10px] text-[#666] tracking-[1.5px]">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-[48px] bg-[var(--c-bg-elev)] border px-4 pr-10 font-ibm-mono text-[13px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none transition-colors ${
            touched && error ? "border-red-500/60 focus:border-red-500" : "border-[var(--c-border)] focus:border-[var(--c-accent)]"
          }`}
        />
        {rightEl && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      {touched && error && (
        <span className="font-ibm-mono text-[9px] text-red-400 tracking-[0.5px]">{error}</span>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "am">("en");
  const [fullName, setFullName] = useState(field());
  const [email, setEmail] = useState(field());
  const [phone, setPhone] = useState(field());
  const [password, setPassword] = useState(field());
  const [confirm, setConfirm] = useState(field());
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const isEn = lang === "en";

  function validateEmail(val: string): string {
    if (!val) return isEn ? "EMAIL IS REQUIRED" : "ኢሜይል ያስፈልጋል";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return isEn ? "INVALID EMAIL FORMAT" : "ትክክለኛ ኢሜይል ያስፈልጋል";
    return "";
  }
  function validatePassword(val: string): string {
    if (val.length < 8) return isEn ? "MINIMUM 8 CHARACTERS" : "ቢያንስ 8 ቁምፊዎች";
    if (!/[A-Z]/.test(val)) return isEn ? "MUST INCLUDE AN UPPERCASE LETTER" : "አንድ ትልቅ ፊደል ያስፈልጋል";
    if (!/[0-9]/.test(val)) return isEn ? "MUST INCLUDE A NUMBER" : "አንድ ቁጥር ያስፈልጋል";
    return "";
  }

  // Strip everything except digits and a leading '+'. Backend phone regex is
  // ^\+?[0-9]{7,15}$ and rejects spaces, dashes, parens — sanitize before POST.
  function sanitizePhone(raw: string): string {
    const trimmed = raw.trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "");
    return hasPlus ? `+${digits}` : digits;
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const nameErr = fullName.value.trim().length < 3 ? (isEn ? "FULL NAME REQUIRED (MIN 3 CHARS)" : "ሙሉ ስም ያስፈልጋል") : "";
    const emailErr = validateEmail(email.value);
    const cleanedPhone = sanitizePhone(phone.value);
    const phoneErr = !/^\+?[0-9]{7,15}$/.test(cleanedPhone)
      ? (isEn ? "PHONE MUST BE 7-15 DIGITS (E.G. +251911223344)" : "ስልክ ቁጥር 7-15 ቁጥሮች መሆን አለበት")
      : "";
    setFullName((f) => ({ ...f, error: nameErr, touched: true }));
    setEmail((f) => ({ ...f, error: emailErr, touched: true }));
    setPhone((f) => ({ ...f, error: phoneErr, touched: true }));
    if (!nameErr && !emailErr && !phoneErr) setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    const passErr = validatePassword(password.value);
    const confirmErr = password.value !== confirm.value ? (isEn ? "PASSWORDS DO NOT MATCH" : "የምስጢር ቃሎቹ አይዛመዱም") : "";
    setPassword((f) => ({ ...f, error: passErr, touched: true }));
    setConfirm((f) => ({ ...f, error: confirmErr, touched: true }));

    if (!passErr && !confirmErr) {
      setLoading(true);
      const { error: signUpError } = await authClient.signUp.email({
        email: email.value.trim(),
        password: password.value,
        name: fullName.value.trim(),
        phone: sanitizePhone(phone.value),
      });
      setLoading(false);
      if (signUpError) {
        setEmail((f) => ({
          ...f,
          error: signUpError.message || (isEn ? "EMAIL ALREADY REGISTERED" : "ኢሜይሉ አስቀድሞ ተመዝግቧል"),
          touched: true,
        }));
        setStep(1);
        return;
      }
      router.push(`/verify-otp?email=${encodeURIComponent(email.value)}`);
    }
  }

  const passwordStrength = (() => {
    const v = password.value;
    if (!v) return 0;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  })();

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-6">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-[440px]">
          <div className="flex items-center justify-center w-[64px] h-[64px] bg-[var(--c-accent)]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5L22 8" stroke="var(--c-text)" strokeWidth="2.5" strokeLinecap="square" />
            </svg>
          </div>
          <div>
            <h1 className="font-grotesk text-[29px] font-bold text-[var(--c-text)] tracking-[-0.5px] text-balance">
              {isEn ? "REGISTRATION SUCCESSFUL" : "ምዝገባ ተሳካ"}
            </h1>
            <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[1px] leading-[1.8] mt-3">
              {isEn
                ? "YOUR ACCOUNT HAS BEEN CREATED. CHECK YOUR EMAIL FOR A VERIFICATION LINK BEFORE SIGNING IN."
                : "መለያዎ ተፈጥሯል። ከመግባትዎ በፊት ኢሜይልዎን ያረጋግጡ።"}
            </p>
          </div>
          <Link href="/login" className="flex items-center justify-center w-full h-[52px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors">
            <span className="font-grotesk text-[13px] font-bold text-[var(--c-text)] tracking-[2px]">
              {isEn ? "GO TO LOGIN" : "ወደ ግቤት ሂድ"}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-[var(--c-bg)] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,214,0,0.06) 0%, transparent 70%)" }} />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 border-r border-[var(--c-border-soft)] px-10 py-12 relative z-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-[36px] h-[36px] bg-[var(--c-accent)]">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-text)] tracking-[1px]">EAA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-ibm-mono text-[11px] font-bold text-[var(--c-text)] tracking-[2px]">EAA RECRUIT</span>
              <span className="font-ibm-mono text-[8px] text-[var(--c-text-muted)] tracking-[1px]">CANDIDATE REGISTRATION</span>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="font-grotesk text-[35px] font-bold text-[var(--c-text)] leading-[1.05] tracking-[-1px] text-balance">
              YOUR AVIATION<br />
              <span className="text-[var(--c-accent)]">CAREER</span><br />
              STARTS HERE.
            </h2>
            <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.8] mt-5">
              REGISTER TO ACCESS OPEN POSITIONS AT ETHIOPIAN AIRLINES AND THE ETHIOPIAN AVIATION ACADEMY. ALL DATA IS PROCESSED WITHIN ETHIOPIA.
            </p>
          </div>
          {/* Step indicator */}
          <div className="flex flex-col gap-3 mt-4">
            {[
              { n: 1, label: isEn ? "PERSONAL DETAILS" : "የግል መረጃ" },
              { n: 2, label: isEn ? "SET PASSWORD" : "የምስጢር ቃል ያዘጋጁ" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-[22px] h-[22px] shrink-0 font-ibm-mono text-[10px] font-bold ${step >= s.n ? "bg-[var(--c-accent)] text-[var(--c-text)]" : "border border-[var(--c-border)] text-[var(--c-text-dim)]"}`}>
                  {step > s.n ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="var(--c-text)" strokeWidth="1.5" strokeLinecap="square" /></svg>
                  ) : s.n}
                </div>
                <span className={`font-ibm-mono text-[10px] tracking-[1px] ${step >= s.n ? "text-[var(--c-text)]" : "text-[var(--c-text-faint)]"}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[0.5px] leading-[1.8]">
          COMPLIANT WITH PROCLAMATION NO. 1329/2023<br />
          DATA STAYS IN ETHIOPIA
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[420px] flex flex-col gap-7">
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
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-[6px] font-ibm-mono text-[10px] tracking-[1.5px] transition-colors ${lang === l ? "bg-[var(--c-accent)] text-[var(--c-text)] font-bold" : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"}`}>
                {l === "en" ? "EN" : "አማ"}
              </button>
            ))}
          </div>

          {/* Step header */}
          <div>
            <p className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[2px] mb-2">[AUTH] // REGISTER — STEP {step}/2</p>
            <h1 className="font-grotesk text-[25px] font-bold text-[var(--c-text)] tracking-[-0.5px]">
              {step === 1 ? (isEn ? "PERSONAL DETAILS" : "የግል መረጃ") : (isEn ? "SET YOUR PASSWORD" : "የምስጢር ቃልዎን ያዘጋጁ")}
            </h1>
            {/* Mobile step dots */}
            <div className="flex items-center gap-2 mt-3 lg:hidden">
              {[1, 2].map((s) => (
                <div key={s} className={`h-[3px] flex-1 transition-colors ${step >= s ? "bg-[var(--c-accent)]" : "bg-[var(--c-border)]"}`} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1} className="flex flex-col gap-5">
              <InputField
                label={isEn ? "FULL NAME" : "ሙሉ ስም"}
                value={fullName.value}
                onChange={(v) => setFullName({ value: v, error: "", touched: false })}
                placeholder={isEn ? "Abdellah Teshome" : "አብደላ ተሾመ"}
                error={fullName.error}
                touched={fullName.touched}
              />
              <InputField
                label={isEn ? "EMAIL ADDRESS" : "ኢሜይል አድራሻ"}
                value={email.value}
                onChange={(v) => setEmail({ value: v, error: "", touched: false })}
                type="email"
                placeholder="you@example.com"
                error={email.error}
                touched={email.touched}
              />
              <InputField
                label={isEn ? "PHONE NUMBER" : "ስልክ ቁጥር"}
                value={phone.value}
                onChange={(v) => setPhone({ value: v, error: "", touched: false })}
                type="tel"
                placeholder="+251911223344"
                error={phone.error}
                touched={phone.touched}
              />
              <button type="submit" className="h-[52px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors flex items-center justify-center">
                <span className="font-grotesk text-[13px] font-bold text-[var(--c-text)] tracking-[2px]">{isEn ? "CONTINUE" : "ቀጥል"}</span>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="flex flex-col gap-5">
              <InputField
                label={isEn ? "PASSWORD" : "የምስጢር ቃል"}
                value={password.value}
                onChange={(v) => setPassword({ value: v, error: "", touched: false })}
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                error={password.error}
                touched={password.touched}
                rightEl={
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="text-[var(--c-text-dim)] hover:text-[var(--c-accent)] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z M7 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" /></svg>
                  </button>
                }
              />
              {/* Password strength */}
              {password.value && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-[3px] flex-1 transition-colors ${passwordStrength >= i ? (passwordStrength >= 4 ? "bg-[var(--c-accent)]" : passwordStrength >= 3 ? "bg-orange-400" : "bg-red-500") : "bg-[var(--c-border)]"}`} />
                    ))}
                  </div>
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[0.5px]">
                    {passwordStrength <= 1 ? (isEn ? "WEAK" : "ደካማ") : passwordStrength <= 2 ? (isEn ? "FAIR" : "መካከለኛ") : passwordStrength <= 3 ? (isEn ? "GOOD" : "ጥሩ") : (isEn ? "STRONG" : "ጠንካራ")}
                  </span>
                </div>
              )}
              <InputField
                label={isEn ? "CONFIRM PASSWORD" : "የምስጢር ቃሉን ያረጋግጡ"}
                value={confirm.value}
                onChange={(v) => setConfirm({ value: v, error: "", touched: false })}
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                error={confirm.error}
                touched={confirm.touched}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="h-[52px] flex-1 border-2 border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors font-ibm-mono text-[10px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] tracking-[1.5px]">
                  {isEn ? "BACK" : "ተመለስ"}
                </button>
                <button type="submit" disabled={loading} className="h-[52px] flex-[2] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] disabled:opacity-50 transition-colors flex items-center justify-center gap-3">
                  {loading && <div className="w-[14px] h-[14px] border-2 border-[var(--c-text)]/30 border-t-[var(--c-text)] rounded-full animate-spin" />}
                  <span className="font-grotesk text-[13px] font-bold text-[var(--c-text)] tracking-[2px]">{isEn ? "CREATE ACCOUNT" : "መለያ ፍጠር"}</span>
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[var(--c-border-soft)]" />
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-faint)] tracking-[1px]">{isEn ? "ALREADY REGISTERED?" : "አስቀድሞ ተመዝግበዋል?"}</span>
            <div className="flex-1 h-[1px] bg-[var(--c-border-soft)]" />
          </div>
          <Link href="/login" className="flex items-center justify-center h-[48px] border-2 border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] hover:text-[var(--c-accent)] tracking-[1.5px] transition-colors">{isEn ? "SIGN IN TO EXISTING ACCOUNT" : "ወደ ነባር መለያ ግባ"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
