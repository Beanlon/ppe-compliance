# GearSight Supabase

## One-time setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste and run [`migrations/202603290001_init.sql`](migrations/202603290001_init.sql).
3. In **Project Settings → API**, copy Project URL and `anon` `public` key.
4. In the app root, copy `.env.example` to `.env.local` and paste those values.
5. Restart `npm run dev`.

Passwords live on Supabase Auth (`auth.users`), not on `profiles`.

## Auth note

For local development, under **Authentication → Providers → Email**, you may disable **Confirm email** so signup signs in immediately.
