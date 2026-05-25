"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const prefilledOtp = (params.get("otp") ?? "").replace(/\D/g, "").slice(0, 6);
  const [otp, setOtp] = useState(prefilledOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (prefilledOtp.length === 6 && email) {
      setInfo("CODE PREFILLED FROM EMAIL LINK — TAP VERIFY");
    }
  }, [prefilledOtp, email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("MISSING EMAIL — START FROM REGISTER");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error: otpError } = await authClient.verifyOtp({ email, otp: otp.trim() });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    router.push("/login");
  }

  async function onResend() {
    if (!email || cooldown > 0) return;
    setError(null);
    setInfo(null);
    const { error: resendError } = await authClient.resendOtp({ email });
    if (resendError) {
      setError(resendError.message);
      if (resendError.status === 429 && resendError.retryAfter) {
        setCooldown(resendError.retryAfter);
      }
      return;
    }
    setInfo("A NEW CODE HAS BEEN SENT");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[var(--c-bg)] overflow-hidden px-6">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-7">
        <div>
          <p className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[2px] mb-2">[AUTH] // VERIFY</p>
          <h1 className="font-grotesk text-[27px] font-bold text-[var(--c-text)] tracking-[-0.5px]">
            VERIFY YOUR EMAIL
          </h1>
          <p className="font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1px] leading-[1.7] mt-3">
            ENTER THE 6-DIGIT CODE SENT TO<br />
            <span className="text-[var(--c-text)]">{email || "—"}</span>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/40">
            <div className="w-[5px] h-[5px] bg-red-400 shrink-0" />
            <span className="font-ibm-mono text-[10px] text-red-400 tracking-[1px]">{error}</span>
          </div>
        )}
        {info && !error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/40">
            <div className="w-[5px] h-[5px] bg-[var(--c-accent)] shrink-0" />
            <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[1px]">{info}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-ibm-mono text-[10px] text-[#666] tracking-[1.5px]">VERIFICATION CODE</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="h-[56px] bg-[var(--c-bg-elev)] border border-[var(--c-border)] px-4 font-ibm-mono text-[20px] tracking-[8px] text-center text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="h-[52px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
          >
            {loading && <div className="w-[16px] h-[16px] border-2 border-[var(--c-text)]/30 border-t-[var(--c-text)] rounded-full animate-spin" />}
            <span className="font-grotesk text-[13px] font-bold text-[var(--c-text)] tracking-[2px]">VERIFY</span>
          </button>

          <button
            type="button"
            onClick={onResend}
            disabled={!email || cooldown > 0}
            className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] disabled:opacity-40 disabled:hover:text-[var(--c-text-dim)] tracking-[1px] transition-colors text-center"
          >
            {cooldown > 0 ? `RESEND IN ${cooldown}S` : "DIDN'T GET A CODE? RESEND"}
          </button>
        </form>

        <div className="flex items-center justify-between">
          <Link href="/register" className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors">
            ← BACK TO REGISTER
          </Link>
          <Link href="/login" className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] hover:text-[var(--c-accent)] tracking-[1px] transition-colors">
            SIGN IN →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
