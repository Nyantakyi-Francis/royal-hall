# Overview
Royal Hall is a room allocation and hall logistics web application built to practice designing and shipping a full-stack product as a software engineer. The goal is to strengthen real-world skills around authentication, role-based admin workflows, data modeling, and building responsive UIs backed by a secure database.

The app supports student registration/login, room request submission, and an admin portal where authorized staff can approve/assign rooms and manage hall inventory.

## Run locally
1) Install dependencies:

```bash
npm i
```

2) Create `.env.local` from `.env.example` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (optional, for server-side admin actions) `SUPABASE_SERVICE_ROLE_KEY`

3) Start the dev server:

```bash
npm run dev
```

4) Open the app:
- `http://localhost:3000`

## Purpose
This project was written to practice:
- Building a modern Next.js app with a clean UI and reliable loading states.
- Using Supabase Auth for sessions and protected routes.
- Designing a relational schema (profiles, rooms, requests, logistics) with Row Level Security (RLS).
- Implementing admin-only tools safely (Route Handlers + server-side authorization).



# Web Pages
- `/` (Home): Landing page entry point.
- `/register` (Register): Creates a user account and stores basic student metadata.
- `/login` (Login): Signs in and redirects to the appropriate dashboard.
- `/forgot-password` and `/reset-password`: Password recovery flow.
- `/student` (Student dashboard): Shows the signed-in user and displays their assigned room when available.
- `/student/rooms` (Room selection): Lists rooms with live occupancy and lets a student submit a room request; it also shows “pending” and “already assigned” states.
- `/admin` (Admin portal): Entry page for admin tools (only for Hall Master/President roles).
- `/admin/allocations` (Room allocations): Displays pending room requests and lets admins approve/reject/assign rooms.
- `/admin/logistics` (Hall logistics): Displays inventory totals and allows admins to create/update logistics items.
- `/admin/roles` (Admin roles): Allows Hall Presidents to grant/revoke admin roles.
- `/admin/password-reset` and `/admin/confirm-user`: Admin utilities for account support.

# Development Environment
- Tools: Node.js, npm, Supabase (Auth + Postgres + RLS), Vercel (deployment), VS Code.
- Language: TypeScript.
- Frameworks/libraries:
  - Next.js (App Router, Route Handlers)
  - React
  - Supabase JS + `@supabase/ssr`
  - Tailwind CSS
  - Zod (validation)
  - React Hook Form

# Useful Websites
* [Next.js Documentation](https://nextjs.org/docs)
* [Supabase Documentation](https://supabase.com/docs)
* [Supabase Auth Guides](https://supabase.com/docs/guides/auth)
* [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [Vercel Documentation](https://vercel.com/docs)

# Supabase Schema
Run these in the Supabase SQL editor (in order):
- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_admin_policies.sql`
- `supabase/migrations/0003_profile_email.sql`
- `supabase/migrations/0004_profiles_trigger.sql`
- `supabase/migrations/0005_profiles_app_role.sql`
- `supabase/migrations/0006_is_admin_uses_profiles_role.sql`
- `supabase/seed.sql`

# Deploy (Vercel)
- Import the `royal-hall` folder as a Vercel project.
- Add the same env vars in Vercel → Project Settings → Environment Variables.

# Future Work
* Add an SMTP provider (or email sandbox) for production-grade deliverability and metrics.
* Add audit logs for admin actions (room approvals/assignments and logistics updates).
* Improve inventory management (delete items, history of changes, bulk edits).
* Add automated tests for critical flows (auth, room request, admin actions).

