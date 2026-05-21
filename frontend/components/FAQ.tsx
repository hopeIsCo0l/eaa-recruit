"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";

const faqs = [
  {
    question: "WHO CAN APPLY ON EAA RECRUIT?",
    answer:
      "Any Ethiopian national or eligible international candidate applying for positions at Ethiopian Airlines or the Ethiopian Aviation Academy. All applicants must meet the minimum qualifications listed for each specific role.",
    defaultOpen: true,
  },
  {
    question: "HOW DOES THE AI CV PARSER WORK?",
    answer:
      "Upload your CV in PDF, DOCX, or scanned image format. Our AI extracts your qualifications, work history, and education automatically. You can review and correct the extracted data before submission to ensure accuracy.",
  },
  {
    question: "IS MY PERSONAL DATA SAFE?",
    answer:
      "Yes. All data is stored exclusively on servers within Ethiopia, fully compliant with Proclamation No. 1329/2023 (Ethiopian Personal Data Protection Proclamation). We never share your data with third parties outside the platform.",
  },
  {
    question: "HOW LONG DOES THE RECRUITMENT PROCESS TAKE?",
    answer:
      "The entire process — from application to final decision — is designed to complete in under 4 weeks. The adaptive exam is available online and can be taken at your convenience within a set window.",
  },
  {
    question: "WHAT IS AN EXPLAINABLE AI (XAI) REPORT?",
    answer:
      "After your assessment, you receive a detailed scorecard that explains exactly why you received your score — which competencies you excelled at, which need improvement, and how you compare to the role requirements. Transparency is at the core of our process.",
  },
  {
    question: "CAN I APPLY FOR MULTIPLE ROLES?",
    answer:
      "Yes. You can apply for multiple open positions simultaneously. Each role has its own specific exam. Your CV profile is shared, but the assessments are independent and role-tailored.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="flex flex-col w-full bg-[var(--c-bg)] py-16 px-6 md:py-[100px] md:px-[120px]">
      <div className="w-full max-w-[520px]">
        <SectionHeader
          label="[05] // FAQ"
          title={"COMMON\nQUESTIONS."}
          subtitle="EVERYTHING CANDIDATES NEED TO KNOW BEFORE APPLYING."
          titleWidth="w-full"
          subtitleWidth="w-full"
        />
      </div>

      <div className="h-10 md:h-[64px]" />

      <div className="flex flex-col w-full">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="flex flex-col w-full border-t border-t-[var(--c-border-soft)]">
              <button
                className="flex items-center justify-between w-full py-5 md:h-[72px] text-left gap-4"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className="font-grotesk text-[15px] md:text-[17px] font-bold text-[var(--c-text)] tracking-[0.5px]">
                  {faq.question}
                </span>
                <div
                  className="flex items-center justify-center w-[32px] h-[32px] shrink-0"
                  style={{
                    backgroundColor: isOpen ? "var(--c-accent)" : "var(--c-bg-muted)",
                    border: isOpen ? "none" : "1px solid var(--c-border)",
                  }}
                >
                  <span
                    className="font-ibm-mono text-[15px] font-bold"
                    style={{ color: isOpen ? "var(--c-text)" : "var(--c-text-sub)" }}
                  >
                    {isOpen ? "—" : "+"}
                  </span>
                </div>
              </button>
              {isOpen && faq.answer && (
                <div className="pb-8">
                  <p className="font-ibm-mono text-[13px] md:text-[14px] text-[var(--c-text-sub)] tracking-[0.5px] leading-[1.7]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div className="border-t border-t-[var(--c-border-soft)]" />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-[16px] pt-10 md:pt-[48px]">
        <span className="font-ibm-mono text-[14px] text-[var(--c-text-muted)] tracking-[1px]">
          STILL HAVE QUESTIONS?
        </span>
        <a
          href="mailto:support@eaarecruit.et"
          className="font-ibm-mono text-[14px] font-bold text-[var(--c-accent)] tracking-[1px] hover:underline"
        >
          CONTACT SUPPORT &gt;
        </a>
      </div>
    </section>
  );
}
