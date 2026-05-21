import SectionHeader from "./SectionHeader";

interface PricingCardProps {
  tier: string;
  tierColor?: string;
  name: string;
  nameColor?: string;
  price: string;
  priceColor?: string;
  btnLabel: string;
  btnLabelColor?: string;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  btnBg?: string;
  btnBorderColor?: string;
  tierBg?: string;
  tierBorderColor?: string;
  features: { label: string; included: boolean }[];
  accentColor?: string;
}

function PricingCard({
  tier,
  tierColor = "var(--c-text-sub)",
  name,
  nameColor = "var(--c-text)",
  price,
  priceColor = "var(--c-text)",
  btnLabel,
  btnLabelColor = "var(--c-text-sub)",
  bgColor = "#0F0F0F",
  borderColor = "var(--c-border)",
  borderWidth = 1,
  btnBg = "var(--c-bg-muted)",
  btnBorderColor = "#3D3D3D",
  tierBg = "var(--c-bg-muted)",
  tierBorderColor = "#3D3D3D",
  features,
  accentColor = "var(--c-text-muted)",
}: PricingCardProps) {
  return (
    <div
      className="flex flex-col gap-8 p-8 md:p-[40px] w-full md:flex-1"
      style={{ backgroundColor: bgColor, border: `${borderWidth}px solid ${borderColor}` }}
    >
      <div
        className="flex items-center justify-center h-[28px] px-[12px] w-fit"
        style={{ backgroundColor: tierBg, border: `1px solid ${tierBorderColor}` }}
      >
        <span className="font-ibm-mono text-[12px] tracking-[2px]" style={{ color: tierColor }}>
          {tier}
        </span>
      </div>
      <span className="font-grotesk text-[29px] font-bold tracking-[1px]" style={{ color: nameColor }}>
        {name}
      </span>
      <div className="flex items-end gap-[4px]">
        <span className="font-grotesk text-[49px] font-bold tracking-[-2px] leading-none" style={{ color: priceColor }}>
          {price}
        </span>
        <span className="font-ibm-mono text-[14px] text-[var(--c-text-muted)] tracking-[1px] mb-[6px]">/MO</span>
      </div>

      {/* Feature list */}
      <div className="flex flex-col gap-[10px]" style={{ borderTop: `1px solid ${borderColor === "#0F0F0F" ? "var(--c-border)" : borderColor}` }}>
        <div className="pt-6 flex flex-col gap-[10px]">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="font-ibm-mono text-[15px] leading-none shrink-0"
                style={{ color: f.included ? accentColor : "var(--c-text-faint)" }}
              >
                {f.included ? "+" : "—"}
              </span>
              <span
                className="font-ibm-mono text-[12px] tracking-[1px]"
                style={{ color: f.included ? "#A0A09A" : "#3D3D3D" }}
              >
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="flex items-center justify-center w-full h-[48px] mt-auto"
        style={{ backgroundColor: btnBg, border: `2px solid ${btnBorderColor}` }}
      >
        <span className="font-ibm-mono text-[13px] tracking-[2px]" style={{ color: btnLabelColor }}>
          {btnLabel}
        </span>
      </button>
    </div>
  );
}

const BUILDER_FEATURES = [
  { label: "UP TO 3 PROJECTS", included: true },
  { label: "1 GB STORAGE", included: true },
  { label: "COMMUNITY SUPPORT", included: true },
  { label: "BASIC ANALYTICS", included: true },
  { label: "CUSTOM DOMAINS", included: false },
  { label: "TEAM COLLABORATION", included: false },
  { label: "PRIORITY RENDERING", included: false },
  { label: "API ACCESS", included: false },
];

const ARCHITECT_FEATURES = [
  { label: "UNLIMITED PROJECTS", included: true },
  { label: "50 GB STORAGE", included: true },
  { label: "PRIORITY SUPPORT", included: true },
  { label: "ADVANCED ANALYTICS", included: true },
  { label: "CUSTOM DOMAINS", included: true },
  { label: "TEAM COLLABORATION", included: true },
  { label: "PRIORITY RENDERING", included: false },
  { label: "API ACCESS", included: false },
];

const SYSTEM_FEATURES = [
  { label: "UNLIMITED PROJECTS", included: true },
  { label: "UNLIMITED STORAGE", included: true },
  { label: "DEDICATED SUPPORT", included: true },
  { label: "FULL ANALYTICS SUITE", included: true },
  { label: "CUSTOM DOMAINS", included: true },
  { label: "TEAM COLLABORATION", included: true },
  { label: "PRIORITY RENDERING", included: true },
  { label: "API ACCESS", included: true },
];

export default function Pricing() {
  return (
    <section id="pricing" className="flex flex-col w-full bg-[#080808] py-16 px-6 md:py-[100px] md:px-[120px] gap-12 md:gap-[64px]">
      <SectionHeader
        label="[09] // PRICING"
        title={"TRANSPARENT.\nNO SURPRISES."}
      />

      <div className="flex flex-col md:flex-row w-full gap-[2px]">
        <PricingCard
          tier="FREE TIER"
          name="BUILDER"
          price="$0"
          btnLabel="GET STARTED FREE"
          features={BUILDER_FEATURES}
          accentColor="var(--c-text-muted)"
        />
        <PricingCard
          tier="MOST POPULAR"
          tierColor="var(--c-text)"
          tierBg="var(--c-accent)"
          tierBorderColor="var(--c-accent)"
          name="ARCHITECT"
          nameColor="var(--c-accent)"
          price="$49"
          priceColor="var(--c-accent)"
          btnLabel="START BUILDING"
          btnLabelColor="var(--c-text)"
          bgColor="var(--c-bg-soft)"
          borderColor="var(--c-accent)"
          borderWidth={2}
          btnBg="var(--c-accent)"
          btnBorderColor="transparent"
          features={ARCHITECT_FEATURES}
          accentColor="var(--c-accent)"
        />
        <PricingCard
          tier="ENTERPRISE"
          tierColor="var(--c-warn)"
          tierBorderColor="var(--c-warn)"
          name="SYSTEM"
          price="$149"
          btnLabel="CONTACT SALES"
          btnLabelColor="var(--c-warn)"
          btnBorderColor="var(--c-warn)"
          features={SYSTEM_FEATURES}
          accentColor="var(--c-warn)"
        />
      </div>
    </section>
  );
}
