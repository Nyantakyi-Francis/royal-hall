import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10">
      <section className="glass rounded-3xl p-6 sm:p-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          MTCE Hall 1 DBMS — <span className="text-emerald-700">Royal Hall</span>
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm text-black/80">
          Register once, log in, select your preferred room, and track admin feedback. Room allocation is done by admins.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700"
          >
            Create student account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60"
          >
            Log in
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60"
          >
            Admin portal
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-soft rounded-3xl p-6">
          <h2 className="text-base font-semibold">Rooms</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-black/80">
            <li>Main Blog (capacity 60)</li>
            <li>Trassaco Blog (R1–R9; 6 each)</li>
            <li>Annex Blog (1A 35, 1B 25, 1C 25, 1D 10)</li>
            <li>East Legon Blog (R16–R19; 6 each)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

