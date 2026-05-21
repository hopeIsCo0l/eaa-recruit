import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-6 py-16 overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 20%, rgba(255,100,50,0.05) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-[580px] gap-10 w-full">

        {/* Lock icon */}
        <div className="flex items-center justify-center w-[80px] h-[80px] border-2 border-[var(--c-warn)]/40 bg-[var(--c-warn)]/05">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="6" y="16" width="24" height="18" stroke="var(--c-warn)" strokeWidth="1.6" />
            <path d="M11 16v-6a7 7 0 0 1 14 0v6" stroke="var(--c-warn)" strokeWidth="1.6" strokeLinecap="square" />
            <circle cx="18" cy="25" r="2.5" fill="var(--c-warn)" />
            <line x1="18" y1="27.5" x2="18" y2="31" stroke="var(--c-warn)" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        </div>

        <div>
          <p className="font-ibm-mono text-[10px] text-[var(--c-warn)] tracking-[3px] mb-3">[SYS-403] // ACCESS DENIED</p>
          <h1 className="font-grotesk text-[81px] md:text-[121px] font-bold text-[var(--c-text)] leading-none tracking-[-4px]">
            4<span className="text-[var(--c-warn)]">0</span>3
          </h1>
          <h2 className="font-grotesk text-[21px] md:text-[27px] font-bold text-[var(--c-text)] tracking-[-0.5px] mt-2 text-balance">
            RESTRICTED AIRSPACE
          </h2>
          <p className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.8] mt-3">
            YOUR CREDENTIALS DO NOT GRANT ACCESS TO THIS SECTOR. THIS AREA IS RESTRICTED TO AUTHORIZED PERSONNEL ONLY. ALL UNAUTHORIZED ACCESS ATTEMPTS ARE LOGGED.
          </p>
        </div>

        {/* Access matrix */}
        <div className="w-full border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--c-border-soft)]">
            <div className="w-[5px] h-[5px] rounded-full bg-[var(--c-warn)]" />
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">ACCESS CONTROL MATRIX</span>
          </div>
          {[
            { route: "/admin", role: "SYSTEM ADMIN", allowed: false },
            { route: "/dashboard", role: "RECRUITER", allowed: false },
            { route: "/candidate", role: "CANDIDATE", allowed: true },
            { route: "/login", role: "ALL USERS", allowed: true },
          ].map((row, i) => (
            <div key={i} className={`flex items-center justify-between gap-4 px-5 py-4 ${i < 3 ? "border-b border-[var(--c-border-soft)]" : ""}`}>
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[0.5px] flex-1 text-left">{row.route}</span>
              <span className="font-ibm-mono text-[9px] text-[var(--c-text-dim)] tracking-[1px]">{row.role}</span>
              <div className={`flex items-center gap-1.5 shrink-0`}>
                <div className={`w-[5px] h-[5px] rounded-full ${row.allowed ? "bg-[var(--c-accent)]" : "bg-red-500"}`} />
                <span className={`font-ibm-mono text-[9px] tracking-[1px] ${row.allowed ? "text-[var(--c-accent)]" : "text-red-400"}`}>
                  {row.allowed ? "PERMITTED" : "RESTRICTED"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 w-full px-4 py-4 border border-[var(--c-warn)]/20 bg-[var(--c-warn)]/04 text-left">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--c-warn)] mt-[1px] shrink-0">
            <path d="M7 1l6 3v4c0 3-6 6-6 6S1 11 1 8V4l6-3z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
          </svg>
          <p className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.8]">
            THIS ACCESS ATTEMPT HAS BEEN RECORDED IN THE IMMUTABLE AUDIT LOG IN COMPLIANCE WITH ETHIOPIAN DATA PROTECTION PROCLAMATION NO. 1329/2023.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/login" className="flex flex-1 items-center justify-center h-[52px] bg-[var(--c-accent)] hover:bg-[var(--c-accent-hover)] transition-colors">
            <span className="font-grotesk text-[12px] font-bold text-[var(--c-text)] tracking-[2px]">SIGN IN WITH CORRECT ROLE</span>
          </Link>
          <Link href="/" className="flex flex-1 items-center justify-center h-[52px] border-2 border-[var(--c-border)] hover:border-[var(--c-accent)] transition-colors">
            <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] hover:text-[var(--c-accent)] tracking-[1.5px] transition-colors">RETURN TO HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
