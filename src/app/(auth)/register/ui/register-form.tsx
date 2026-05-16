"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const schema = z.object({
  fullName: z.string().min(3, "Enter your full name"),
  level: z.enum(["LEVEL_100", "LEVEL_200", "LEVEL_300"]),
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", level: "LEVEL_100", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      setError(null);
      setMessage(null);
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            level: values.level,
            hall: "HALL_1",
          },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }

      setMessage(
        data.session
          ? "Account created. You can log in now."
          : "Account created. Check your email to confirm, then log in.",
      );
      startTransition(() => router.push("/login"));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed";
      setError(message);
    }
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block">
        <span className="text-sm font-medium">Full name</span>
        <input
          className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          placeholder="Surname Othername"
          autoComplete="name"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName && (
          <p className="mt-1 text-xs text-black">{form.formState.errors.fullName.message}</p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium">Hall</span>
        <input
          className="mt-1 w-full rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-black"
          value="Hall 1"
          readOnly
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Level</span>
        <select
          className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          {...form.register("level")}
        >
          <option value="LEVEL_100">Level 100</option>
          <option value="LEVEL_200">Level 200</option>
          <option value="LEVEL_300">Level 300</option>
        </select>
      </label>

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
            autoComplete="new-password"
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
      {message && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-black">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
