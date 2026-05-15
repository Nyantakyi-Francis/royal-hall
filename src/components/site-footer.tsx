"use client";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-7 text-xs text-black/80 md:flex-row md:items-center md:justify-between">
        <div>
          Created by{" "}
          <a
            href="https://nyantakyi-francis.github.io/portfolio/index.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-emerald-800 hover:underline"
          >
            Nyantakyi Francis
          </a>{" "}
          • All rights reserved © {year}
        </div>
        
      </div>
    </footer>
  );
}

