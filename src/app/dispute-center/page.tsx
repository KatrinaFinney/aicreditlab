'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DisputeTracker from '@/components/DisputeTracker';
import { letterTemplates } from '@/lib/letterTemplates';

type Allowance = { accountGoal: "personal" | "business"; paid: boolean; used: number; limit: number; remaining: number; resetAt: string };

export default function DisputeCenter() {
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  useEffect(() => {
    fetch('/api/letter-usage').then(async (response) => {
      if (!response.ok) throw new Error('Unavailable');
      setAllowance(await response.json());
    }).catch(() => setError('Could not check your letter allowance. Please try again later.'));
  }, []);
  const locked = !!allowance && !allowance.paid && allowance.remaining === 0;
  const results = letterTemplates.filter((item) => (category === 'All' || item.category === category) &&
    `${item.title} ${item.guidance}`.toLowerCase().includes(query.toLowerCase()));
  return <main style={{ padding: '40px 20px', background: 'transparent', minHeight: '100vh', color: 'var(--text)' }}>
    <div style={{ maxWidth: 1000, margin: 'auto' }}>
      <h1 style={{ color: 'var(--accent)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Dispute letters</h1>
      {allowance?.accountGoal === "business" ? <div className="glass-card" style={{ padding: 24, }}><h2>Business reports need a different playbook</h2><p>These letters and dispute cases are for personal credit reports. For a mistake on a business report, get the report from the business reporting company, follow its dispute process, and keep your supporting records.</p><Link href="/dashboard">Back to my business plan</Link></div> : <>
      <p>Found a real mistake on your personal credit report? Find a letter starting point, add your facts, and review it before you send. Keep copies of everything.</p>
      <p style={{ background: 'var(--surface-raised)', padding: 16, borderRadius: 10 }}>
        <strong>One thing at a time:</strong> start with one or two well-documented errors. That’s a way to stay organized, not a credit bureau rule. The CFPB recommends naming each specific mistake, explaining why it’s wrong, and including copies of supporting documents.
        {' '}<a href="https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-an-error-on-my-credit-report-en-314/" target="_blank" rel="noopener noreferrer">Read CFPB guidance</a>.
      </p>
      <details className="glass-card" style={{ padding: 16, marginBottom: 20 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Quick check before you draft</summary>
        <ol style={{ lineHeight: 1.8 }}>
          <li>Review the report from the bureau showing the error. <a href="https://www.annualcreditreport.com/" target="_blank" rel="noopener noreferrer">AnnualCreditReport.com</a> provides free reports.</li>
          <li>Choose a specific inaccuracy and gather copies of records that explain it. Keep copies of the letter and anything you send.</li>
          <li>Consider contacting both the reporting bureau and the company that supplied the information. <a href="https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/sample-letters-dispute-credit-report-information/" target="_blank" rel="noopener noreferrer">CFPB offers examples for each recipient</a>.</li>
          <li>Do not dispute information you know is accurate merely because it is negative. <a href="https://consumer.ftc.gov/articles/fixing-your-credit-faqs" target="_blank" rel="noopener noreferrer">FTC credit guidance</a>.</li>
        </ol>
      </details>
      {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
      {allowance && <p role="status" style={{ color: 'var(--accent)', fontWeight: 700 }}>
        {allowance.paid ? `Paid plan: unlimited template downloads · ${allowance.remaining} of 5 AI generations left this month` :
          `${allowance.remaining} of 3 free letter downloads left this month`}
        {' · '}Resets {new Date(allowance.resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} (UTC)
      </p>}
      {locked ? <div className="glass-card" style={{ padding: 24, border: '1px solid var(--line)', }}>
        <h2>Your free downloads are tapped out for now</h2>
        <p>You’ve used your three free downloads this month. They reset at the start of the next UTC month. Your saved cases are still here whenever you need them.</p>
      </div> : !allowance ? <p>Checking letter access…</p> : <>
        <label style={{ display: 'block', margin: '24px 0 12px' }}>What’s looking off?
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try balance, late payment, duplicate…"
            style={{ display: 'block', padding: 12, width: '100%', maxWidth: 440, marginTop: 6, borderRadius: 8, border: '1px solid var(--line)' }} />
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {['All', ...new Set(letterTemplates.map((item) => item.category))].map((item) => <button key={item}
            type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
            style={{ padding: '8px 12px', borderRadius: 20, border: '1px solid var(--accent)', background: category === item ? 'var(--accent-strong)' : 'var(--surface)', color: category === item ? '#071d25' : 'var(--accent)' }}>{item}</button>)}
        </div>
        <p>{results.length} letter starting points</p>
        <div className="letter-grid">
          {results.map((item) => <article key={item.id} className="glass-card letter-card" style={{ padding: 20, border: '1px solid var(--line)' }}>
            <small style={{ color: 'var(--accent)' }}>{item.category}</small><h2 style={{ fontSize: 19 }}>{item.title}</h2>
            <p>{item.guidance}</p><Link href={`/dispute-generator?template=${item.id}`}>Make this letter mine →</Link>
          </article>)}
        </div>
      </>}
      </>}
    </div>
    {allowance?.accountGoal !== "business" && <DisputeTracker />}
  </main>;
}
