# AI CreditLab

Next.js app using Clerk for sign-in and Supabase for stored credit plans, progress, dispute cases, and letter usage. The 30 free letter starters live in the application code.

## Local setup

1. Run `npm ci`.
2. Create `.env.local` with `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY` from the intended projects. For billing, also set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, and the HTTPS canonical return URL `NEXT_PUBLIC_APP_URL`. Never expose the service role, Stripe secret, webhook secret, or OpenAI key in `NEXT_PUBLIC_` variables or commit them.
3. Apply the SQL files in `supabase/migrations` in filename order. The baseline creates legacy tables and locks down browser-role access. The later migrations add progress, quotas, account goal, paid saved plans, and subscriptions. The service role bypasses RLS; keep it server-only.
4. Run `npm run dev`, sign in, complete the questionnaire, mark steps done, prepare a dispute draft, save and update a case, then revisit with a second account to confirm isolation.

The original AI CreditLab Supabase project was paused in April 2025 and cannot resume in the dashboard. A new project, `AI CreditLab 2026` (`wsnnriiqkcvazkvhrwdm`), was created in the Harvest Union organization. Its base tables and new migrations were applied on September 28, 2026. A private import from the downloaded legacy backup restored three `public.users` rows, seven `credit_plans`, and five `disputes`; its storage archive was empty. Do not commit the private backup or import file. The new project reports Canada Central as its primary database region; review data residency before production use. Supabase Auth users in the backup numbered zero; app accounts use Clerk.

The API routes check Clerk's user ID on every request. Only server code uses the Supabase service role key, and all account queries filter by the authenticated ID. RLS is enabled, and browser roles have no table access on the five app tables. The project has no direct browser policies. The legacy rows retain their old user IDs and may not match current Clerk accounts; avoid silently reassigning them. Deployment environment settings and two-account behavior still require verification before a production release.

`npm test -- --runInBand` checks plan generation, template selection, and access rules. `npm run build` checks the production bundle and types. `npm run diagnose` reports missing local settings without printing secrets; `npm run diagnose:live` checks Supabase tables and quota function and asks OpenAI whether the configured key is accepted. Run the live diagnostic only in a trusted environment where you have the keys. It does not generate a paid letter or change user records. The quota limits were exercised against the live database inside a rolled-back transaction; end-to-end account flows still need deployed keys and test accounts.

The free experience offers one rules-based plan, saved progress and focus preferences, 30 customizable issue-specific letter starters, three server-issued template downloads per UTC calendar month, and manually updated dispute statuses. Paid accounts can save multiple plans and have unlimited template downloads and five successful AI generations per UTC month. Failed generation requests release the reserved slot. The UI cannot prevent copying text already displayed in a preview; the quota governs downloads requested through the app. It does not contact credit bureaus, access a user's credit report, send reminders, or guarantee score changes. Paid AI drafting uses the OpenAI Responses API after explicit consent if the server has `OPENAI_API_KEY`; `OPENAI_LETTER_MODEL` optionally overrides the default model.

The Plus subscription is $9.99 USD per month. Create an active recurring Stripe Price with amount 999 cents, currency USD, interval month and interval count 1; checkout validates `STRIPE_PRICE_ID` before use. Checkout requires a completed personal assessment and a configured signed webhook. Billing never grants access on redirect; only an active matching subscription grants paid access. Trialing and failed/canceled subscriptions do not grant paid access. Paid status is account-wide, while consumer letter and dispute tools require the active plan to be personal. Paid users may save both personal and business plans; subscription management remains available for either goal. Dispute records and monthly letter quotas remain user-scoped, not separate for each saved plan.

Register `/api/billing/webhook` for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. The signed webhook reconciles current matching subscription state; failed writes return a retryable error. Configure the customer portal before testing Manage subscription.

### Database and billing rollout

- Keep `20260929_subscriptions.sql` and apply the new forward migration `20261001_billing_consolidation.sql` after it. The sole billing store is `billing_subscriptions`; the new migration validates customer ownership/status and updates an existing assessment atomically. Existing billing and saved-plan records are preserved. The migration has not been applied by this code change.
- Do not apply the superseded PR #6 `20260928_z_billing.sql`. If someone already applied it or created customers through that branch, stop rollout and reconcile its `billing_accounts` records against Stripe before switching implementations; do not silently drop records or create replacement customers.
- Customer/subscription metadata uses `clerkUserId`; webhook ownership comes from the stored customer mapping, not untrusted request IDs or metadata.
- Preview and production previously shared `wsnnriiqkcvazkvhrwdm`. Test checkout, portal and webhooks fail closed against that database. Use a separate Supabase project for tests, apply all migrations there, set `NEXT_PUBLIC_SUPABASE_URL` and its service-role key, then set `BILLING_TEST_DATABASE_URL` to that same isolated URL. Test billing is always blocked on Vercel production. Never set this marker to the production project.
- Test signed-in checkout, duplicate subscriptions, renewal/failure, cancellation, free/paid limits, saved-plan switching and two-account isolation before release. Confirm the $9.99/month offer in Stripe before any live charge. Signed-in mobile review remains required; Google-to-Clerk cloud sign-in previously offered only a passkey, so Safari may be needed.

Professional client management, email programs, and model-generated credit advice are not implemented.

### Free release while billing setup is pending

New subscription checkout is disabled by default. Leave `BILLING_CHECKOUT_ENABLED` unset or set it to `false` in Preview and Production for the free release. The dashboard and homepage show Letter Boost as coming soon; the checkout endpoint rejects requests before database or Stripe work. Free billing summaries do not require Stripe configuration. Existing paid subscriptions retain access to subscription management; webhooks remain available to reconcile their state.

After business registration and Stripe setup are complete, enable `BILLING_CHECKOUT_ENABLED=true` only in the isolated test Preview and redeploy. Complete checkout, duplicate checkout, portal, signed webhooks, renewal/failure/cancellation, paid AI generation, monthly caps and saved-plan tests there. Enable the flag in Production only after those checks pass and live Stripe keys, price, portal and webhook are configured. Do not grant paid access manually to bypass billing.

Free-release gates remain: database migrations, personal/business account isolation, saved progress, three free downloads and monthly cap, and signed-in mobile review. Deferring Stripe does not waive these checks.
