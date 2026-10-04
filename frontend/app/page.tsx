"use client";

import { FormEvent, useMemo, useState } from "react";

type LuckyOption = {
  label: string;
  query: string;
};

const searchSuggestions = [
  "ethiopian aviation academy admission",
  "pilot training requirements",
  "airline interview preparation",
  "aircraft maintenance career path",
  "cabin crew communication skills",
  "aviation scholarship opportunities",
  "aviation english test practice",
  "ground operations checklist",
];

const luckyOptions: LuckyOption[] = [
  { label: "I’m Feeling Curious", query: "how planes stay in the air" },
  { label: "I’m Feeling Inspired", query: "women in aviation leaders" },
  { label: "I’m Feeling Adventurous", query: "most scenic airports in the world" },
  { label: "I’m Feeling Prepared", query: "best interview questions for pilots" },
];

const linkClass =
  "text-[13px] text-[#1a73e8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 rounded-sm";

export default function Home() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return searchSuggestions.slice(0, 5);
    }

    return searchSuggestions
      .filter((item) => item.toLowerCase().includes(normalized))
      .slice(0, 5);
  }, [query]);

  const runSearch = (value: string, lucky = false) => {
    const term = value.trim();
    if (!term) return;

    const target = lucky
      ? `https://www.google.com/search?q=${encodeURIComponent(term)}&btnI=1`
      : `https://www.google.com/search?q=${encodeURIComponent(term)}`;

    window.location.assign(target);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  const handleLucky = () => {
    const random = luckyOptions[Math.floor(Math.random() * luckyOptions.length)];
    setQuery(random.query);
    runSearch(random.query, true);
  };

  return (
    <main className="min-h-screen bg-white text-[#202124] font-sans antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 py-4">
        <header className="flex items-center justify-between">
          <nav aria-label="Top left links" className="flex items-center gap-4">
            <a href="#" className={linkClass}>
              About
            </a>
            <a href="#" className={linkClass}>
              Store
            </a>
          </nav>

          <nav aria-label="Top right links" className="flex items-center gap-4">
            <a href="#" className={linkClass}>
              Apps
            </a>
            <a href="#" className={linkClass}>
              Settings
            </a>
          </nav>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center pb-24">
          <h1
            aria-label="Google"
            className="mb-8 text-[84px] font-medium leading-none tracking-[-0.04em]"
          >
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </h1>

          <form onSubmit={handleSubmit} className="w-full max-w-[640px]" role="search">
            <div className="relative">
              <label htmlFor="search-input" className="sr-only">
                Search
              </label>
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 100)}
                placeholder="Search"
                autoComplete="off"
                className="h-14 w-full rounded-full border border-[#dfe1e5] bg-white px-14 text-base shadow-sm outline-none transition hover:shadow-md focus:border-[#1a73e8]/40 focus:shadow-md"
              />
              <svg
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#9aa0a6]"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15.5 15.5L20 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            {focused && filteredSuggestions.length > 0 ? (
              <ul className="mt-2 overflow-hidden rounded-2xl border border-[#dadce0] bg-white py-2 shadow-lg" role="listbox" aria-label="Suggestions">
                {filteredSuggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onMouseDown={() => setQuery(suggestion)}
                      onClick={() => runSearch(suggestion)}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-[#3c4043] hover:bg-[#f8f9fa] focus-visible:bg-[#f8f9fa] focus-visible:outline-none"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="submit"
                className="h-9 rounded border border-[#f8f9fa] bg-[#f8f9fa] px-4 text-sm text-[#3c4043] hover:border-[#dadce0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
              >
                Google Search
              </button>
              <button
                type="button"
                onClick={handleLucky}
                className="h-9 rounded border border-[#f8f9fa] bg-[#f8f9fa] px-4 text-sm text-[#3c4043] hover:border-[#dadce0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
              >
                I’m Feeling Lucky
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
            {luckyOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => {
                  setQuery(option.query);
                  runSearch(option.query);
                }}
                className="rounded-full border border-[#dadce0] px-3 py-1.5 text-[#1a73e8] transition hover:bg-[#f1f3f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e4e4e4] py-3 text-[13px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Footer left links" className="flex flex-wrap items-center gap-5">
              <a href="#" className={linkClass}>
                Advertising
              </a>
              <a href="#" className={linkClass}>
                Business
              </a>
              <a href="#" className={linkClass}>
                How Search works
              </a>
            </nav>
            <nav aria-label="Footer right links" className="flex flex-wrap items-center gap-5">
              <a href="#" className={linkClass}>
                Privacy
              </a>
              <a href="#" className={linkClass}>
                Terms
              </a>
              <a href="#" className={linkClass}>
                Settings
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
