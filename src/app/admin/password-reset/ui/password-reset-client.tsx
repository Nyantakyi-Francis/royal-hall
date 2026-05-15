"use client";

import { useState } from "react";

export default function PasswordResetClient({ enabled }: { enabled: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError(null);
    setLink(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Request failed");
      setLink(json.link ?? null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-6">
      {!enabled && (
        <div className="mb-4 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 px-3 py-2 text-sm text-black backdrop-blur">
          View only (Hall President required).
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">User email (Gmail)</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          placeholder="name@gmail.com"
          disabled={!enabled || loading}
        />
      </label>

      <button
        type="button"
        onClick={generate}
        disabled={!enabled || loading || !email}
        className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate reset link"}
      </button>

      {error && (
        <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-white/70 px-3 py-2 text-sm text-black backdrop-blur">
          {error}
        </div>
      )}

      {link && (
        <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 px-3 py-2 text-sm backdrop-blur">
          <div className="mb-1 text-xs text-black/70">Reset link</div>
          <div className="break-all font-mono text-xs text-black">{link}</div>
        </div>
      )}
    </div>
  );
}

