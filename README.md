Royal Hall (Hall 1) — MTCE Hall 1 DBMS

Stack: Next.js (Node) + Supabase + Vercel

## Local dev

1) Install deps

```bash
npm i
```

2) Create `.env.local` from `.env.example` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (optional for server-side admin actions) `SUPABASE_SERVICE_ROLE_KEY`

3) Run dev server

```bash
npm run dev
```

## Supabase schema

Run these in Supabase SQL editor (in order):
- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_admin_policies.sql`
- `supabase/migrations/0003_profile_email.sql`
- `supabase/migrations/0004_profiles_trigger.sql`
- `supabase/seed.sql`

## Deploy (Vercel)

- Import the `royal-hall` folder as a Vercel project
- Add the same env vars in Vercel → Project Settings → Environment Variables

April Peterson