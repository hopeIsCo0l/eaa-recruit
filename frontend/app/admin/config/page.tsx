"use client";

import { useState } from "react";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
      <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">{children}</span>
    </div>
  );
}

function ConfigBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5 border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)] flex flex-col gap-5">
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px]">{label}</label>
      {children}
      {hint && <p className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-[38px] bg-[var(--c-bg)] border border-[var(--c-border)] px-3 font-ibm-mono text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors"
    />
  );
}

function SliderField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[var(--c-accent)] h-[2px] cursor-pointer"
        />
        <span className="font-ibm-mono text-[13px] font-bold text-[var(--c-accent)] w-[52px] text-right shrink-0">
          {value}{unit}
        </span>
      </div>
    </Field>
  );
}

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-3 mt-6">
      <button className="h-[38px] px-5 border border-[var(--c-border)] font-ibm-mono text-[10px] text-[var(--c-text-muted)] tracking-[1.5px] hover:text-[var(--c-text)] hover:border-[var(--c-text-muted)] transition-colors">
        DISCARD
      </button>
      <button
        onClick={onSave}
        className="h-[38px] px-6 bg-[var(--c-accent)] font-ibm-mono text-[10px] font-bold text-[var(--c-text)] tracking-[2px] hover:bg-[var(--c-accent-hover)] transition-colors"
      >
        SAVE CHANGES
      </button>
    </div>
  );
}

export default function ConfigPage() {
  // NLP
  const [stopwords, setStopwords] = useState(
    "aviation, flight, aircraft, pilot, crew, airline, duty, roster, report, comply, adherence, responsibility, team, ensure, support"
  );

  // Thresholds
  const [shortlistCutoff, setShortlistCutoff] = useState(70);
  const [examTimer, setExamTimer]             = useState(90);
  const [vectorWeight, setVectorWeight]       = useState(60);
  const [examWeight, setExamWeight]           = useState(40);

  // SMTP
  const [smtpHost, setSmtpHost]   = useState("smtp.eaa.et");
  const [smtpPort, setSmtpPort]   = useState("587");
  const [smtpUser, setSmtpUser]   = useState("recruit@eaa.et");
  const [smtpPass, setSmtpPass]   = useState("");

  // SMS
  const [smsGateway, setSmsGateway] = useState("https://sms.ethiotelecom.et/api");
  const [smsKey, setSmsKey]         = useState("");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Save toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-[var(--c-bg-elev)] border border-[var(--c-accent)]">
          <div className="w-[6px] h-[6px] rounded-full bg-[var(--c-accent)]" />
          <span className="font-ibm-mono text-[10px] text-[var(--c-accent)] tracking-[1.5px]">CONFIGURATION SAVED</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[05] // CONFIGURATION</span>
        <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">
          System Configuration
        </h1>
        <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
          Global rules, NLP settings, integration credentials, and scoring weights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* NLP Stopwords */}
        <div className="lg:col-span-2">
          <SectionLabel>NLP PREPROCESSOR — AVIATION STOPWORDS</SectionLabel>
          <ConfigBlock>
            <Field
              label="STOPWORD LIST (COMMA-SEPARATED)"
              hint="These words are stripped from CVs before vectorization. Tuning this list directly affects similarity score quality."
            >
              <textarea
                value={stopwords}
                onChange={(e) => setStopwords(e.target.value)}
                rows={4}
                className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] px-3 py-2 font-ibm-mono text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-faint)] focus:outline-none focus:border-[var(--c-accent)] transition-colors resize-none leading-relaxed"
              />
            </Field>
            <div className="flex items-center gap-3 font-ibm-mono text-[9px] text-[var(--c-text-dim)]">
              <span>{stopwords.split(",").filter(Boolean).length} WORDS DEFINED</span>
              <div className="w-[1px] h-[10px] bg-[var(--c-border)]" />
              <button
                onClick={() => setStopwords("")}
                className="text-[var(--c-warn)] hover:text-[var(--c-text)] transition-colors tracking-[1px]"
              >
                CLEAR ALL
              </button>
            </div>
          </ConfigBlock>
        </div>

        {/* Global Thresholds */}
        <div>
          <SectionLabel>GLOBAL THRESHOLDS</SectionLabel>
          <ConfigBlock>
            <SliderField
              label="SHORTLIST CUTOFF SCORE"
              hint="Candidates below this score are automatically marked as Not Shortlisted."
              value={shortlistCutoff}
              onChange={setShortlistCutoff}
              min={40}
              max={95}
              unit="%"
            />
            <SliderField
              label="EXAM TIMER (DEFAULT)"
              hint="Default duration for role-specific written assessments."
              value={examTimer}
              onChange={setExamTimer}
              min={30}
              max={180}
              unit=" MIN"
            />
            <div className="border-t border-[var(--c-border-soft)] pt-4">
              <p className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[1.5px] mb-4">SCORING WEIGHT ALLOCATION</p>
              <SliderField
                label="CV VECTOR WEIGHT"
                value={vectorWeight}
                onChange={(v) => { setVectorWeight(v); setExamWeight(100 - v); }}
                min={20}
                max={80}
                unit="%"
              />
              <div className="mt-3">
                <SliderField
                  label="EXAM SCORE WEIGHT"
                  value={examWeight}
                  onChange={(v) => { setExamWeight(v); setVectorWeight(100 - v); }}
                  min={20}
                  max={80}
                  unit="%"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-[4px] bg-[var(--c-bg-muted)] overflow-hidden flex">
                  <div className="h-full bg-[var(--c-accent)] transition-all" style={{ width: `${vectorWeight}%` }} />
                  <div className="h-full bg-[var(--c-warn)] transition-all" style={{ width: `${examWeight}%` }} />
                </div>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)]">TOTAL: 100%</span>
              </div>
            </div>
          </ConfigBlock>
        </div>

        {/* Integration Settings */}
        <div>
          <SectionLabel>INTEGRATION SETTINGS — SMTP</SectionLabel>
          <ConfigBlock>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SMTP HOST">
                <TextInput value={smtpHost} onChange={setSmtpHost} placeholder="smtp.eaa.et" />
              </Field>
              <Field label="SMTP PORT">
                <TextInput value={smtpPort} onChange={setSmtpPort} placeholder="587" />
              </Field>
            </div>
            <Field label="SMTP USERNAME">
              <TextInput value={smtpUser} onChange={setSmtpUser} placeholder="recruit@eaa.et" type="email" />
            </Field>
            <Field label="SMTP PASSWORD" hint="Stored encrypted at rest (AES-256).">
              <TextInput value={smtpPass} onChange={setSmtpPass} placeholder="••••••••••••" type="password" />
            </Field>
          </ConfigBlock>

          <div className="mt-6">
            <SectionLabel>INTEGRATION SETTINGS — SMS GATEWAY</SectionLabel>
            <ConfigBlock>
              <Field label="SMS GATEWAY URL" hint="Ethiotelecom SMS API endpoint.">
                <TextInput value={smsGateway} onChange={setSmsGateway} placeholder="https://sms.ethiotelecom.et/api" />
              </Field>
              <Field label="API KEY" hint="Stored encrypted at rest (AES-256).">
                <TextInput value={smsKey} onChange={setSmsKey} placeholder="••••••••••••••••" type="password" />
              </Field>
              <button className="flex items-center gap-[8px] h-[34px] px-4 border border-[var(--c-border)] self-start font-ibm-mono text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)] hover:border-[var(--c-accent)] transition-colors tracking-[1.5px]">
                TEST CONNECTION /
              </button>
            </ConfigBlock>
          </div>
        </div>
      </div>

      <SaveBar onSave={handleSave} />
    </div>
  );
}
