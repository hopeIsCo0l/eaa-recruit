"use client";

const CURSORS = [
  {
    name: "ALEX_K",
    color: "var(--c-accent)",
    textColor: "var(--c-text)",
    animName: "cursor-alex",
    duration: "18s",
    keyframes: `@keyframes cursor-alex {
      0%   { transform: translate(12vw, 8vh); }
      15%  { transform: translate(40vw, 18vh); }
      30%  { transform: translate(55vw, 30vh); }
      50%  { transform: translate(30vw, 42vh); }
      65%  { transform: translate(15vw, 25vh); }
      80%  { transform: translate(48vw, 12vh); }
      100% { transform: translate(12vw, 8vh); }
    }`,
  },
  {
    name: "SARA_M",
    color: "var(--c-warn)",
    textColor: "var(--c-bg)",
    animName: "cursor-sara",
    duration: "22s",
    keyframes: `@keyframes cursor-sara {
      0%   { transform: translate(60vw, 5vh); }
      20%  { transform: translate(22vw, 20vh); }
      40%  { transform: translate(45vw, 38vh); }
      55%  { transform: translate(65vw, 22vh); }
      75%  { transform: translate(30vw, 8vh); }
      90%  { transform: translate(50vw, 32vh); }
      100% { transform: translate(60vw, 5vh); }
    }`,
  },
  {
    name: "JIN_L",
    color: "#4ADE80",
    textColor: "var(--c-text)",
    animName: "cursor-jin",
    duration: "26s",
    keyframes: `@keyframes cursor-jin {
      0%   { transform: translate(35vw, 35vh); }
      18%  { transform: translate(18vw, 15vh); }
      35%  { transform: translate(58vw, 10vh); }
      52%  { transform: translate(32vw, 45vh); }
      70%  { transform: translate(52vw, 28vh); }
      85%  { transform: translate(10vw, 35vh); }
      100% { transform: translate(35vw, 35vh); }
    }`,
  },
  {
    name: "MILA_V",
    color: "#60A5FA",
    textColor: "var(--c-text)",
    animName: "cursor-mila",
    duration: "30s",
    keyframes: `@keyframes cursor-mila {
      0%   { transform: translate(68vw, 40vh); }
      12%  { transform: translate(38vw, 12vh); }
      30%  { transform: translate(15vw, 28vh); }
      48%  { transform: translate(55vw, 46vh); }
      65%  { transform: translate(42vw, 18vh); }
      82%  { transform: translate(25vw, 38vh); }
      100% { transform: translate(68vw, 40vh); }
    }`,
  },
];

export default function CollabCursors() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block"
      style={{ zIndex: 20 }}
    >
      <style>{CURSORS.map((c) => c.keyframes).join("\n")}</style>

      {CURSORS.map((cursor) => (
        <div
          key={cursor.name}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            animation: `${cursor.animName} ${cursor.duration} cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            willChange: "transform",
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="16"
            height="18"
            viewBox="0 0 20 22"
            fill="none"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.7))" }}
          >
            <path
              d="M2 2L18 10L10 12L6 20L2 2Z"
              fill={cursor.color}
              stroke="var(--c-text)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Name tag */}
          <div
            style={{
              position: "absolute",
              left: "14px",
              top: "14px",
              backgroundColor: cursor.color,
              padding: "2px 8px",
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: 700,
              color: cursor.textColor,
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
