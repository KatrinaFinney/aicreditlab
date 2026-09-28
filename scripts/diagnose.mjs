import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
const env = process.env;
let failures = 0;
const report = (label, ok, detail) => {
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${label}: ${detail}\n`);
  if (!ok) failures++;
};
const required = [
  ['Clerk publishable key', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'Add this key to local and deployment settings.'],
  ['Clerk server key', 'CLERK_SECRET_KEY', 'Add this server-only key to local and deployment settings.'],
  ['Supabase URL', 'NEXT_PUBLIC_SUPABASE_URL', 'Link the existing Supabase project.'],
  ['Supabase service role key', 'SUPABASE_SERVICE_ROLE_KEY', 'Add the server-only key; never prefix it NEXT_PUBLIC_.'],
  ['OpenAI API key', 'OPENAI_API_KEY', 'Add the server-only key to enable paid AI drafts.'],
];
for (const [label, name, instruction] of required) {
  report(label, Boolean(env[name]), env[name] ? 'configured' : instruction);
}
if (!process.argv.includes('--live')) {
  process.stdout.write('INFO Live schema and credentials were not checked. Run npm run diagnose:live in a trusted environment.\n');
  process.exitCode = failures ? 1 : 0;
} else {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const tables = [
      ['credit_plans', 'user_id,plan_type,account_goal,selected_disputes,credit_plan'],
      ['credit_plan_progress', 'user_id,completed_steps,focus_mode,session_minutes'],
      ['disputes', 'id,user_id,creditor,agency,status'],
      ['letter_usage', 'id,user_id,kind,period_start,status'],
    ];
    for (const [table, columns] of tables) {
      try {
        const response = await fetch(`${url}/rest/v1/${table}?select=${columns}&limit=0`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000),
        });
        report(`Supabase ${table}`, response.ok,
          response.ok ? 'required columns reachable' :
            response.status === 404 || response.status === 400 ? `schema mismatch or missing migration (HTTP ${response.status})` :
            response.status === 401 || response.status === 403 ? `server key or permission rejected (HTTP ${response.status})` :
            `request failed (HTTP ${response.status})`);
      } catch { report(`Supabase ${table}`, false, 'network or project URL unreachable'); }
    }
    try {
      const response = await fetch(`${url}/rest/v1/disputes?select=id&user_id=eq.user_diagnostic_no_record&limit=0`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000),
      });
      report('Clerk-compatible dispute IDs', response.ok,
        response.ok ? 'disputes.user_id accepts text Clerk IDs' :
          response.status === 400 ? 'disputes.user_id may still be UUID; apply the baseline migration' :
          `request failed (HTTP ${response.status})`);
    } catch { report('Clerk-compatible dispute IDs', false, 'network or project URL unreachable'); }
    try {
      const response = await fetch(`${url}/rest/v1/rpc/reserve_letter_slot`, {
        method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_user_id: null, p_kind: 'invalid', p_limit: 0 }), signal: AbortSignal.timeout(10000),
      });
      report('Atomic quota function', response.status === 400,
        response.status === 400 ? 'function exists and rejected invalid input' :
          response.status === 404 ? 'apply the letter quota migration' : `unexpected response (HTTP ${response.status})`);
    } catch { report('Atomic quota function', false, 'network or project URL unreachable'); }
  }
  if (env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, signal: AbortSignal.timeout(10000),
      });
      report('OpenAI credential', response.ok,
        response.ok ? 'API accepted the key (no letter was generated)' :
          response.status === 401 ? 'key rejected; check the project API key' : `API request failed (HTTP ${response.status})`);
    } catch { report('OpenAI credential', false, 'network or API unreachable'); }
  }
  process.exitCode = failures ? 1 : 0;
}
