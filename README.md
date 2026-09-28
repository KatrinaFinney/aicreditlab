# AI CreditLab

Next.js app using Clerk for sign-in and Supabase for stored credit plans and dispute templates.

## Local setup

1. Run `npm ci`.
2. Create `.env.local` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` from the existing Clerk and Supabase projects. Never expose the service role key in a `NEXT_PUBLIC_` variable or commit it.
3. Confirm the Supabase `credit_plans` table has a unique `user_id` text column, `selected_disputes` JSONB, `credit_plan` JSONB, `questionnaire_completed` boolean, and `plan_type` text. The write route uses `ON CONFLICT (user_id)`. Confirm the `dispute_templates` table contains `id`, `title`, `category`, `download_pdf_url`, and optionally `download_docx_url`; the `disputes` table needs `user_id`, `creditor`, `agency`, and `status`.
4. Run `npm run dev`, sign in, complete the questionnaire, revisit it to update answers, and confirm another account cannot see the first account's plan.

The API routes check Clerk's user ID on every request. Only server code uses the Supabase service role key, and all account queries filter by the authenticated ID. Enable Row Level Security on user tables as an additional database safeguard, and do not add broad anonymous access policies. The live schema, environment settings, and two-account behavior still require verification before a production release.

`npm test -- --runInBand` checks plan generation and input validation. `npx tsc --noEmit` checks types.

The paid roadmap, billing, dispute status tracking, and AI letter generation are not yet implemented. The letter generator route currently returns placeholder text and should not be offered as a completed feature.
