"use client";

import { useState } from "react";

const initialSkills = [
  { id: 1,  term: "B787 Type Rating",          category: "Certification", weight: 97, manual: false },
  { id: 2,  term: "ATPL License (ECAA)",        category: "Certification", weight: 95, manual: false },
  { id: 3,  term: "ICAO English Level 5",       category: "Certification", weight: 91, manual: false },
  { id: 4,  term: "Navigation Systems",         category: "Technical",     weight: 92, manual: false },
  { id: 5,  term: "IFR Operations",             category: "Technical",     weight: 88, manual: false },
  { id: 6,  term: "Crew Resource Management",   category: "Soft Skill",    weight: 84, manual: false },
  { id: 7,  term: "Safety Management Systems",  category: "Soft Skill",    weight: 79, manual: false },
  { id: 8,  term: "Meteorology",                category: "Technical",     weight: 75, manual: false },
  { id: 9,  term: "Emergency Procedures",       category: "Technical",     weight: 90, manual: false },
  { id: 10, term: "Air Law (ICAO Annex 2)",      category: "Certification", weight: 87, manual: false },
];

function categoryColor(cat: string) {
  if (cat === "Certification") return "var(--c-accent)";
  if (cat === "Technical") return "var(--c-accent-hover)";
  return "var(--c-text-sub)";
}

const CATEGORIES = ["Certification", "Technical", "Soft Skill"] as const;

export default function ProfilePage() {
  const [skills, setSkills] = useState(initialSkills);
  const [newTerm, setNewTerm] = useState("");
  const [newCat, setNewCat] = useState<typeof CATEGORIES[number]>("Technical");
  const [personalInfo, setPersonalInfo] = useState({
    name: "Amanuel Tadesse",
    email: "amanuel.t@example.com",
    phone: "+251 91 234 5678",
    location: "Addis Ababa, Ethiopia",
    experience: "12",
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "skills">("info");

  const removeSkill = (id: number) => setSkills((prev) => prev.filter((s) => s.id !== id));

  const addSkill = () => {
    if (!newTerm.trim()) return;
    setSkills((prev) => [
      ...prev,
      { id: Date.now(), term: newTerm.trim(), category: newCat, weight: 70, manual: true },
    ]);
    setNewTerm("");
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Compute relative font sizes for the cloud
  const maxWeight = Math.max(...skills.map((s) => s.weight));
  const minWeight = Math.min(...skills.map((s) => s.weight));

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="font-ibm-mono text-[10px] text-[var(--c-text-dim)] tracking-[2px]">[06] // MY PROFILE</span>
          <h1 className="font-grotesk text-[25px] md:text-[33px] font-bold text-[var(--c-text)] tracking-[-1px]">My Profile</h1>
          <p className="font-ibm-mono text-[11px] text-[var(--c-text-muted)] tracking-[0.5px]">
            Manage personal information and your AI-visible Skills Cloud.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 h-[44px] font-ibm-mono text-[9px] font-bold tracking-[1.5px] transition-all"
          style={{ background: saved ? "var(--c-accent-hover)" : "var(--c-accent)", color: "var(--c-text)" }}
        >
          {saved ? "SAVED /" : "SAVE CHANGES /"}
        </button>
      </div>

      {/* Avatar + summary strip */}
      <div className="flex items-center gap-5 bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] p-5">
        <div className="flex items-center justify-center w-[60px] h-[60px] bg-[var(--c-accent)] shrink-0">
          <span className="font-grotesk text-[23px] font-bold text-[var(--c-text)]">AT</span>
        </div>
        <div className="flex flex-col gap-[3px]">
          <span className="font-grotesk text-[19px] font-bold text-[var(--c-text)]">{personalInfo.name}</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px]">{personalInfo.email}</span>
            <div className="w-[1px] h-[10px] bg-[var(--c-border)]" />
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px]">{personalInfo.location}</span>
            <div className="w-[1px] h-[10px] bg-[var(--c-border)]" />
            <span className="font-ibm-mono text-[9px] text-[var(--c-text-muted)] tracking-[0.5px]">{personalInfo.experience} YRS EXPERIENCE</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-[5px] bg-[var(--c-accent)]/08 border border-[var(--c-accent)]/20 shrink-0">
          <div className="w-[5px] h-[5px] rounded-full bg-[var(--c-accent)]" />
          <span className="font-ibm-mono text-[8px] text-[var(--c-accent)] tracking-[1px]">PROFILE COMPLETE</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)]">
        {(["info", "skills"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-6 py-3 font-ibm-mono text-[9px] tracking-[1.5px] transition-all"
            style={{ background: activeTab === tab ? "var(--c-accent)12" : "var(--c-bg-elev)", color: activeTab === tab ? "var(--c-accent)" : "var(--c-text-muted)", borderBottom: activeTab === tab ? "2px solid var(--c-accent)" : "2px solid transparent" }}
          >
            {tab === "info" ? "PERSONAL INFO" : "SKILLS CLOUD"}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--c-border-soft)]">
          {[
            { label: "FULL NAME",          key: "name",       type: "text" },
            { label: "EMAIL ADDRESS",      key: "email",      type: "email" },
            { label: "PHONE NUMBER",       key: "phone",      type: "tel" },
            { label: "LOCATION / CITY",    key: "location",   type: "text" },
            { label: "YEARS OF EXPERIENCE",key: "experience", type: "number" },
          ].map((field) => (
            <div key={field.key} className="flex flex-col gap-2 bg-[var(--c-bg-elev)] p-5">
              <label className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{field.label}</label>
              <input
                type={field.type}
                value={personalInfo[field.key as keyof typeof personalInfo]}
                onChange={(e) => setPersonalInfo((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-4 py-3 focus:outline-none focus:border-[var(--c-accent)] transition-colors tracking-[0.5px]"
              />
            </div>
          ))}

          <div className="flex flex-col gap-3 bg-[var(--c-bg-elev)] p-5">
            <label className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">LANGUAGE PREFERENCE</label>
            <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)]">
              {["ENGLISH", "AMHARIC"].map((lang) => (
                <button
                  key={lang}
                  className="flex-1 py-3 font-ibm-mono text-[9px] tracking-[1px] transition-all"
                  style={{ background: lang === "ENGLISH" ? "var(--c-accent)" : "var(--c-bg-elev)", color: lang === "ENGLISH" ? "var(--c-text)" : "var(--c-text-muted)" }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skills Cloud Tab */}
      {activeTab === "skills" && (
        <div className="flex flex-col gap-6">
          {/* Visual cloud */}
          <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">AI SKILLS CLOUD</span>
                <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[1px]">SIZE = RELEVANCE WEIGHT // COLOR = CATEGORY</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center min-h-[120px]">
              {[...skills].sort((a, b) => b.weight - a.weight).map((skill) => {
                const normalised = (skill.weight - minWeight) / (Math.max(1, maxWeight - minWeight));
                const fontSize = 9 + normalised * 12; // 9px → 21px
                const opacity = 0.5 + normalised * 0.5;
                return (
                  <div
                    key={skill.id}
                    className="group relative flex items-center gap-1 cursor-default"
                  >
                    <span
                      className="font-ibm-mono font-bold tracking-[0.5px] transition-all"
                      style={{ fontSize: `${fontSize}px`, color: categoryColor(skill.category), opacity }}
                    >
                      {skill.term}
                    </span>
                    {skill.manual && (
                      <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">(+)</span>
                    )}
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="hidden group-hover:flex items-center justify-center w-[14px] h-[14px] text-[var(--c-warn)] bg-[var(--c-bg)] border border-[var(--c-warn)]/30 absolute -top-[6px] -right-[6px]"
                      aria-label={`Remove ${skill.term}`}
                    >
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                        <path d="M1 1l4 4M5 1L1 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-3 border-t border-[#111]">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-[5px]">
                  <div className="w-[6px] h-[6px] rounded-full" style={{ background: categoryColor(cat) }} />
                  <span className="font-ibm-mono text-[8px] text-[var(--c-text-dim)]">{cat.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add new skill */}
          <div className="bg-[var(--c-bg-elev)] border border-[var(--c-border-soft)] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-[14px] bg-[var(--c-accent)] shrink-0" />
              <span className="font-ibm-mono text-[10px] text-[var(--c-text-sub)] tracking-[2px]">ADD SKILL MANUALLY</span>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. EASA Part-66 Module 7"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-text)] font-ibm-mono text-[11px] px-4 py-3 focus:outline-none focus:border-[var(--c-accent)] placeholder:text-[#222] transition-colors tracking-[0.5px]"
              />
              <div className="flex items-center gap-[1px] bg-[var(--c-border-soft)] shrink-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewCat(cat)}
                    className="px-3 py-3 font-ibm-mono text-[8px] tracking-[1px] transition-all whitespace-nowrap"
                    style={{ background: newCat === cat ? "var(--c-accent)" : "var(--c-bg-elev)", color: newCat === cat ? "var(--c-text)" : "var(--c-text-muted)" }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={addSkill}
                className="px-5 py-3 bg-[var(--c-accent)] font-ibm-mono text-[9px] font-bold text-[var(--c-text)] tracking-[1.5px] hover:bg-[var(--c-accent-hover)] transition-colors shrink-0"
              >
                ADD /
              </button>
            </div>
          </div>

          {/* Skills list table */}
          <div className="border border-[var(--c-border-soft)] bg-[var(--c-bg-elev)]">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-[var(--c-bg)] border-b border-[var(--c-border-soft)]">
              {["SKILL TERM", "CATEGORY", "WEIGHT", ""].map((h) => (
                <span key={h} className="font-ibm-mono text-[8px] text-[var(--c-text-dim)] tracking-[1.5px]">{h}</span>
              ))}
            </div>
            {skills.map((skill) => (
              <div key={skill.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#111] items-center hover:bg-[var(--c-bg)] transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-ibm-mono text-[10px] text-[var(--c-text)] truncate">{skill.term}</span>
                  {skill.manual && (
                    <span className="font-ibm-mono text-[7px] text-[var(--c-text-dim)] px-1 py-[1px] border border-[var(--c-border)] shrink-0">MANUAL</span>
                  )}
                </div>
                <span
                  className="font-ibm-mono text-[8px] px-2 py-[2px] tracking-[1px] whitespace-nowrap"
                  style={{ color: categoryColor(skill.category), background: `${categoryColor(skill.category)}10` }}
                >
                  {skill.category.toUpperCase()}
                </span>
                <div className="flex items-center gap-2 w-[100px]">
                  <div className="flex-1 h-[3px] bg-[var(--c-bg-muted)]">
                    <div className="h-full" style={{ width: `${skill.weight}%`, background: categoryColor(skill.category) }} />
                  </div>
                  <span className="font-ibm-mono text-[9px] text-[var(--c-text-sub)] shrink-0">{skill.weight}</span>
                </div>
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] hover:text-[var(--c-warn)] tracking-[0.5px] transition-colors"
                >
                  REMOVE /
                </button>
              </div>
            ))}
          </div>

          <span className="font-ibm-mono text-[8px] text-[var(--c-text-faint)] tracking-[0.5px]">
            Skills extracted by AI are read-only by default. Manually added skills are marked and will be re-verified on your next CV upload.
          </span>
        </div>
      )}
    </div>
  );
}
