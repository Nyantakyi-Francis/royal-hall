"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("Reset link sent. Check your email.");
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
      </label>

      {message && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-black">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-emerald-700 bg-white px-3 py-2 text-sm text-black">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Send reset link
      </button>

      <div className="text-sm">
        <Link href="/login" className="text-emerald-700 hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  );
}
