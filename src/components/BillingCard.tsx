"use client";

import { useEffect, useState } from 'react';

type BillingState = { accountGoal: 'personal' | 'business' | null; paid: boolean;
  status: string | null; hasBillingAccount: boolean; price: string | null };

export default function BillingCard() {
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch('/api/billing').then(async (response) => {
    if (response.ok) setBilling(await response.json());
    else setError('Could not load billing options.');
  }).catch(() => setError('Could not load billing options.')); }, []);

  async function goToBilling(action: 'checkout' | 'portal') {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/billing/${action}`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || 'Billing is unavailable');
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Billing is unavailable');
      setBusy(false);
    }
  }

  return <section style={{ background: 'var(--surface)', padding: 20, borderRadius: 12,
    border: '1px solid var(--line)', marginTop: 24 }} aria-labelledby="billing-heading">
    <h2 id="billing-heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>Your plan & billing</h2>
    {billing?.accountGoal === 'business' ? <p>The business action plan is free. Personal credit letter tools are only available with a personal credit plan.</p> : <>
      <p>{billing?.paid ? 'You have the paid personal plan: unlimited template downloads and five AI drafts per UTC calendar month.' :
        'The free personal plan includes three letter downloads per UTC calendar month. The paid plan adds unlimited template downloads and five AI drafts per UTC calendar month.'}</p>
      {billing?.status && <p>Subscription status: {billing.status.replaceAll('_', ' ')}</p>}
      {billing?.hasBillingAccount && <button type="button" disabled={busy} onClick={() => goToBilling('portal')}>Manage subscription</button>}
      {!billing?.paid && billing?.accountGoal === 'personal' && billing?.price && !billing?.hasBillingAccount &&
        <p>{billing.price} per month. Stripe will show the full price and terms before you pay.</p>}
      {!billing?.paid && billing?.accountGoal === 'personal' && billing?.price &&
        !['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete'].includes(billing?.status ?? '') &&
        <button type="button" disabled={busy} onClick={() => goToBilling('checkout')} style={{ marginLeft: billing.hasBillingAccount ? 12 : 0 }}>
          {busy ? 'Opening checkout…' : 'Upgrade to paid'}</button>}
      {billing?.accountGoal === 'personal' && !billing.price && !billing.paid &&
        <p>Subscription checkout is not available yet.</p>}
    </>}
    {billing?.accountGoal === null && <p>Complete your assessment to see your plan options.</p>}
    {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
  </section>;
}
