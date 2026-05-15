"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

function toSafeNextPath(value: string | null) {
  if (!value) return "/student";
  // Allow only internal relative paths to avoid invalid/unsafe URLs.
  if (!value.startsWith("/")) return "/student";
  if (value.startsWith("//")) return "/student";
  if (value.includes("://")) return "/student";
  if (/[\\\s]/.test(value)) return "/student";
  return value;
}

function toFriendlyAuthError(message: string) {
  if (message.toLowerCase().includes("email not confirmed")) return "Verify your email in your inbox.";
  return message;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => toSafeNextPath(searchParams.get("next")), [searchParams]);

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = body?.error ? toFriendlyAuthError(body.error) : "Sign in failed";
        setError(message);
        return;
      }

      startTransition(() => router.push(next));
    } catch (e) {
      const message = e instanceof Error ? toFriendlyAuthError(e.message) : "Sign in failed";
      setError(message);
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block">
        <span className="text-sm font-medium">Gmail</span>
        <input
          className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          placeholder="name@gmail.com"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-black">{form.formState.errors.email.message}</p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <div className="mt-1 flex items-stretch gap-2">
          <input
            className="w-full rounded-xl border border-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="shrink-0 rounded-xl border border-black/20 bg-white px-3 text-sm font-medium hover:bg-emerald-50"
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "View"}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1 text-xs text-black">{form.formState.errors.password.message}</p>
        )}
      </label>

      {error && (
        <div className="rounded-xl border border-emerald-700 bg-white px-3 py-2 text-sm text-black">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || form.formState.isSubmitting}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-emerald-700 hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-black hover:underline">
          Create account
        </Link>
      </div>
    </form>
  );
}
