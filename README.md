# Alumni registration — 110th celebrations (2028)

This is a small Next.js site that collects alumni contact details and stores them in a Supabase table called `alumni`.

What you'll find here

- A simple React/Next page at `/` with a registration form.
- `lib/supabaseClient.js` — a minimal Supabase client that reads your public keys from environment variables.
- Tailwind CSS for quick styling.

Quick start

1. Copy the environment file

   Copy `.env.local.example` to `.env.local` and fill in your Supabase values (project URL and anon key):

   ```bash
   cp .env.local.example .env.local
   # then edit .env.local and paste your values
   ```

2. Install dependencies and run locally

   ```bash
   npm install
   npm run dev
   # open http://localhost:3000
   ```

Supabase table (SQL)

Use the SQL editor in your Supabase project to create a table named `alumni`:

```sql
create table public.alumni (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  graduation_year int,
  message text,
  created_at timestamptz default now()
);

-- Optional index on email
create index on public.alumni (email);
```

Notes on security

- This scaffold uses the Supabase client from the browser (public anon key). For basic contact collection you can allow inserts from anon client and use Row Level Security (RLS) accordingly.
- Recommended approach: enable RLS and add a policy that allows inserts to `alumni` (or use a server API route with a service role key if you require stricter validation).

Next steps & tips

- Add server-side validation or an API route if you want to hide logic or use the service role key.
- Add a confirmation email or admin dashboard to manage entries.

If you want, I can also:
- Add an API route that uses a Supabase service role key (requires adding the key to `.env.local` and careful handling).
- Add basic tests or a deploy pipeline.
