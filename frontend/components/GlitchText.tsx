"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** ms before typing starts after entering viewport */
  delay?: number;
  /** ms between each character */
  speed?: number;
}

export default function GlitchText({
  text,
  className = "",
  delay = 0,
  speed = 40,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          setTimeout(() => {
            setStarted(true);
            let i = 0;
            const interval = setInterval(() => {
              i++;
              setDisplayed(text.slice(0, i));
              if (i >= text.length) {
                clearInterval(interval);
                setTimeout(() => setDone(true), 800);
              }
            }, speed);
          }, delay);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text, speed, delay]);

  return (
    // Outer span: holds the full text invisibly to reserve exact dimensions
    <span ref={ref} className={className} style={{ position: "relative", display: "inline-block" }}>
      {/* Ghost text — always here, reserves width + height, never visible */}
      <span aria-hidden="true" style={{ visibility: "hidden", whiteSpace: "pre" }}>
        {text}
      </span>

      {/* Animated text — absolutely overlaid, same position */}
      <span
        aria-live="polite"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          whiteSpace: "pre",
        }}
      >
        {started ? displayed : ""}
        {started && !done && (
          <span
            style={{
              display: "inline-block",
              width: "0.06em",
              height: "0.85em",
              backgroundColor: "currentColor",
              marginLeft: "2px",
              verticalAlign: "middle",
              animation: "tw-blink 0.7s step-end infinite",
            }}
          />
        )}
      </span>

      <style>{`
        @keyframes tw-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
