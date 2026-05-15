"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    startTransition(() => {
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isPending}
      className="rounded-full border border-black/15 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm shadow-black/5 backdrop-blur hover:bg-emerald-50/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Logging out..." : "Log out"}
    </button>
  );
}

