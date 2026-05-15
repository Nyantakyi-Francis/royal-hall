import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Missing/invalid env vars. Create .env.local from .env.example and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`,
    );
  }

  const normalizedUrl = new URL(parsed.data.NEXT_PUBLIC_SUPABASE_URL).origin;

  return {
    ...parsed.data,
    // Ensure we always store the project "origin" (no /rest/v1, /auth/v1, etc.)
    // Wrong URLs cause auth to hit paths like /rest/v1/auth/v1/* and 404.
    NEXT_PUBLIC_SUPABASE_URL: normalizedUrl,
  };
}
