import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "EAA Recruit — The Future of Aviation Recruitment",
  description:
    "An AI-powered recruitment platform for Ethiopian Airlines and the Ethiopian Aviation Academy. Transparent, fair, and fast-track hiring in under 4 weeks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initThemeScript = `
    (() => {
      try {
        const stored = localStorage.getItem("theme");
        const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const theme = stored === "dark" || stored === "light" ? stored : system;
        document.documentElement.setAttribute("data-theme", theme);
      } catch {
        document.documentElement.setAttribute("data-theme", "light");
      }
    })();
  `;

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full bg-[var(--c-bg)] overflow-x-hidden`}
      >
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
