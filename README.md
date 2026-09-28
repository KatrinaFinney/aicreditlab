# AI CreditLab

Next.js app using Clerk for sign-in and Supabase for stored credit plans and dispute templates.

## Local setup

1. Run `npm ci`.
2. Create `.env.local` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` from the existing Clerk and Supabase projects. Never expose the service role key in a `NEXT_PUBLIC_` variable or commit it.
3. Confirm the Supabase `credit_plans` table has a unique `user_id` text column, `selected_disputes` JSONB, `credit_plan` JSONB, `questionnaire_completed` boolean, and `plan_type` text. The write route uses `ON CONFLICT (user_id)`. Confirm the `dispute_templates` table contains `id`, `title`, `category`, `download_pdf_url`, and optionally `download_docx_url`; the `disputes` table needs `id`, `user_id`, `creditor`, `agency`, and `status`. The dispute status field must accept `Draft`, `Sent`, and `Resolved`.
4. Apply `supabase/migrations/20260928_credit_plan_progress.sql` to create saved plan progress, focus mode, and short session preferences. Review existing RLS policies on all tables before allowing access; the service role bypasses RLS, so browser access should not expose another user's records.
5. Run `npm run dev`, sign in, complete the questionnaire, mark steps done, prepare a dispute draft, save and update a case, then revisit with a second account to confirm isolation.

The API routes check Clerk's user ID on every request. Only server code uses the Supabase service role key, and all account queries filter by the authenticated ID. Enable Row Level Security on user tables as an additional database safeguard, and do not add broad anonymous access policies. The live schema, environment settings, and two-account behavior still require verification before a production release.

`npm test -- --runInBand` checks plan generation and input validation. `npx tsc --noEmit` checks types.

The free experience offers a rules-based plan, saved progress and focus preferences, a library of four customizable letter types, and manually updated dispute statuses. It does not contact credit bureaus, access a user's credit report, send reminders, or guarantee score changes. Paid accounts can request a tailored draft through the OpenAI Responses API after explicit consent if the server has `OPENAI_API_KEY`. `OPENAI_LETTER_MODEL` optionally overrides the default model. No billing or self-service upgrade exists yet: a trusted operator must provision paid status, and this feature must be tested with a real key before release. Professional client management, email programs, and model-generated credit advice are not implemented.
