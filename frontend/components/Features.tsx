import SectionHeader from "./SectionHeader";

interface FeatureCardProps {
  accentColor: string;
  tag: string;
  title: string;
  description: string;
  bgColor?: string;
  borderColor?: string;
  icon: React.ReactNode;
}

function FeatureCard({
  accentColor,
  tag,
  title,
  description,
  bgColor = "var(--c-bg-soft)",
  borderColor = "var(--c-border)",
  icon,
}: FeatureCardProps) {
  return (
    <div
      className="flex flex-col gap-5 p-8 md:p-[32px] border w-full md:flex-1 md:min-h-[340px]"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      {/* Icon area */}
      <div
        className="flex items-center justify-center w-[48px] h-[48px] shrink-0"
        style={{ backgroundColor: `${accentColor}22`, border: `1px solid ${accentColor}44` }}
      >
        {icon}
      </div>
      {/* Tag */}
      <div
        className="flex items-center justify-center h-[26px] px-[10px] w-fit border"
        style={{ borderColor: accentColor, background: `${accentColor}11` }}
      >
        <span className="font-ibm-mono text-[11px] tracking-[2px]" style={{ color: accentColor }}>
          {tag}
        </span>
      </div>
      <h3 className="font-grotesk text-[19px] font-bold text-[var(--c-text)] tracking-[0.5px] leading-[1.2]">
        {title}
      </h3>
      <p className="font-ibm-mono text-[13px] text-[#666666] tracking-[0.5px] leading-[1.6]">
        {description}
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="flex flex-col w-full bg-[var(--c-bg)] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]"
    >
      <SectionHeader
        label="[01] // VALUE PROPOSITIONS"
        title={"WHY EAA RECRUIT\nIS DIFFERENT."}
        subtitle="THREE PILLARS THAT SEPARATE OBJECTIVE HIRING FROM SUBJECTIVE GUESSWORK."
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <FeatureCard
          accentColor="var(--c-accent)"
          tag="AI CV PARSING"
          title="Automated Skill Extraction"
          description="Our AI engine reads PDFs, DOCXs, and even scanned images — extracting qualifications, experience, and education without human bias. Every candidate is evaluated on merit."
          bgColor="var(--c-bg-soft)"
          borderColor="var(--c-accent)"
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="2" width="10" height="13" rx="1" stroke="var(--c-accent)" strokeWidth="1.5" />
              <path d="M6 7h4M6 10h4M6 13h2" stroke="var(--c-accent)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="16" cy="15" r="4" stroke="var(--c-accent)" strokeWidth="1.5" />
              <path d="M14.5 15h3M16 13.5v3" stroke="var(--c-accent)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          }
        />
        <FeatureCard
          accentColor="#4ADE80"
          tag="ADAPTIVE EXAMS"
          title="Role-Specific Technical Assessments"
          description="Candidates sit automated examinations tailored to their applied role — Flight Operations, Maintenance, or In-Flight Services. Questions adapt based on prior answers for precise skill measurement."
          bgColor="var(--c-bg-soft)"
          borderColor="var(--c-border)"
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="4" width="18" height="14" rx="1" stroke="#4ADE80" strokeWidth="1.5" />
              <path d="M7 9l3 3 5-5" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <FeatureCard
          accentColor="#60A5FA"
          tag="XAI REPORTS"
          title="Explainable AI Scoring"
          description="Transparency at every step. Recruiters see exactly why a candidate received their score. Candidates receive clear feedback they can act on. No black boxes — just fair, auditable decisions."
          bgColor="var(--c-bg-soft)"
          borderColor="var(--c-border)"
          icon={
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#60A5FA" strokeWidth="1.5" />
              <path d="M11 7v4l3 2" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="11" cy="11" r="1.5" fill="#60A5FA" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
