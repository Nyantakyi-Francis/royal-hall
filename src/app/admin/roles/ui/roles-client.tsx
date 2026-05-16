"use client";

import { useState, useTransition } from "react";

export default function RolesClient({ canManage }: { canManage: boolean }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"HALL_MASTER" | "HALL_PRESIDENT">("HALL_MASTER");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function submit(action: "SET" | "REMOVE") {
    setError(null);
    setStatus(null);
    setSaving(true);
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, email, role }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json?.error ?? "Request failed");
      setSaving(false);
      return;
    }
    setStatus("Saved. Refreshing...");
    startTransition(() => window.location.reload());
  }

  return (
    <div className="glass rounded-3xl p-6">
      {!canManage && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          View only (Hall President required).
        </div>
      )}
      {status && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {status}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-emerald-700 bg-white px-3 py-2 text-sm text-black">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">User email (Gmail)</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            placeholder="name@gmail.com"
            disabled={!canManage || isPending || saving}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "HALL_MASTER" | "HALL_PRESIDENT")}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            disabled={!canManage || isPending || saving}
          >
            <option value="HALL_MASTER">Hall Master</option>
            <option value="HALL_PRESIDENT">Hall President</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canManage || isPending || saving || !email}
          onClick={() => submit("SET")}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Set role"}
        </button>
        <button
          type="button"
          disabled={!canManage || isPending || saving || !email}
          onClick={() => submit("REMOVE")}
          className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Remove admin"}
        </button>
      </div>
    </div>
  );
}
