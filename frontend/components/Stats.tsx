const stats = [
  { value: "< 4 WKS", label: "FAST-TRACK CYCLE",    border: true  },
  { value: "3 ROLES", label: "AVIATION CATEGORIES",  border: true  },
  { value: "100%",    label: "DATA SOVEREIGNTY",     border: true  },
  { value: "XAI",     label: "EXPLAINABLE SCORING",  border: false },
];

export default function Stats() {
  return (
    <section className="flex flex-col w-full bg-[var(--c-accent)] py-12 px-6 md:py-[80px] md:px-[120px]">
      <span className="font-ibm-mono text-[13px] font-bold text-[var(--c-text)]/50 tracking-[3px]">
        [03] // BY THE NUMBERS
      </span>
      <div className="h-8 md:h-[32px]" />
      <div className="grid grid-cols-2 md:flex w-full gap-[2px] md:gap-0">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-2 items-center justify-center py-6 md:py-0 md:h-[160px] md:flex-1
              ${stat.border ? "md:border-r-2 md:border-r-[var(--c-text)]/20" : ""}
              ${i === 0 ? "md:pr-[40px]" : i === stats.length - 1 ? "md:pl-[40px]" : "md:px-[40px]"}
              ${i % 2 === 0 ? "border-r-2 border-r-[var(--c-text)]/20 pr-4 md:border-r-0 md:pr-0" : "pl-4 md:pl-0"}
              ${i >= 2 ? "border-t-2 border-t-[var(--c-text)]/20 pt-4 md:border-t-0 md:pt-0" : ""}
            `}
          >
            <span className="font-grotesk text-[37px] md:text-[57px] font-bold text-[var(--c-text)] tracking-[-2px] leading-none">
              {stat.value}
            </span>
            <span className="font-ibm-mono text-[11px] md:text-[12px] font-bold text-[var(--c-text)]/60 tracking-[2px] text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
