import SectionHeader from "./SectionHeader";

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  bgColor?: string;
  borderColor?: string;
  accentColor?: string;
}

function StepCard({
  number,
  title,
  description,
  bgColor = "var(--c-bg)",
  borderColor = "var(--c-border)",
  accentColor = "var(--c-accent)",
}: StepCardProps) {
  return (
    <div
      className="flex flex-col gap-4 p-8 md:p-[40px] border w-full md:flex-1 md:min-h-[280px]"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <span
        className="font-grotesk text-[53px] font-bold tracking-[-2px] leading-none"
        style={{ color: accentColor }}
      >
        {number}
      </span>
      <h3 className="font-grotesk text-[19px] font-bold text-[var(--c-text)] tracking-[0.5px] leading-[1.2]">
        {title}
      </h3>
      <p className="font-ibm-mono text-[12px] text-[var(--c-text-muted)] tracking-[0.5px] leading-[1.6]">
        {description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="flex flex-col w-full bg-[var(--c-bg-elev)] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]"
    >
      <SectionHeader
        label="[02] // HOW IT WORKS"
        title={"FOUR STEPS.\nCLEAR PATH."}
        subtitle="A STREAMLINED PROCESS DESIGNED TO REDUCE CANDIDATE ANXIETY AND DELIVER RESULTS FAST."
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <StepCard
          number="01"
          title="Register"
          description="Create your secure profile in minutes. Your data is encrypted and stored entirely within Ethiopia — fully compliant with Proclamation No. 1329/2023."
          bgColor="var(--c-bg-soft)"
          borderColor="var(--c-accent)"
          accentColor="var(--c-accent)"
        />
        <StepCard
          number="02"
          title="Apply"
          description="Upload your CV in any format — PDF, DOCX, or even a scanned image. Our AI parser extracts your skills, education, and experience automatically."
          accentColor="var(--c-accent)"
        />
        <StepCard
          number="03"
          title="Assess"
          description="Take your role-specific technical exam from anywhere. Questions adapt to your responses for precise and fair evaluation across all aviation domains."
          bgColor="var(--c-bg-soft)"
          borderColor="var(--c-border)"
          accentColor="var(--c-accent)"
        />
        <StepCard
          number="04"
          title="Track"
          description="Receive immediate AI-generated feedback and an explainable scorecard. Monitor your application status in real time on your personal dashboard."
          accentColor="var(--c-warn)"
        />
      </div>

      {/* Timeline bar */}
      <div className="flex items-center w-full gap-0 border border-[var(--c-border)] overflow-hidden">
        {["REGISTER", "APPLY", "ASSESS", "TRACK"].map((step, i) => (
          <div
            key={step}
            className="flex items-center justify-center flex-1 py-3 gap-2"
            style={{
              background:
                i === 0
                  ? "rgba(255,214,0,0.18)"
                  : i === 1
                  ? "rgba(255,214,0,0.08)"
                  : i === 2
                  ? "rgba(255,214,0,0.04)"
                  : "rgba(10,10,10,0.5)",
              borderRight: i < 3 ? "1px solid var(--c-border)" : "none",
            }}
          >
            <span className="font-ibm-mono text-[10px] md:text-[12px] tracking-[2px]"
              style={{ color: i === 0 ? "var(--c-accent)" : "var(--c-text-muted)" }}>
              {step}
            </span>
            {i < 3 && (
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-faint)]">&gt;</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
