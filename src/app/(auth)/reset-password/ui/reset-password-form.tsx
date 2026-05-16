"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const schema = z.object({ password: z.string().min(6) });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block">
        <span className="text-sm font-medium">New password</span>
        <input
          className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
      </label>
      {error && (
        <div className="rounded-xl border border-emerald-700 bg-white px-3 py-2 text-sm text-black">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || form.formState.isSubmitting}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
