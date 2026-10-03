"use client";

import { useEffect, useState } from 'react';

type BillingState = { accountGoal: 'personal' | 'business' | null; paid: boolean;
  status: string | null; hasBillingAccount: boolean; price: string | null; checkoutEnabled: boolean };

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
    <h2 id="billing-heading" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>Your plan, your call</h2>
    {!billing && !error && <p role="status">Loading billing options…</p>}
    {billing?.hasBillingAccount && billing.status && <button type="button" disabled={busy} onClick={() => goToBilling('portal')}>Manage subscription</button>}
    {billing?.accountGoal === 'business' ? <p>Business plans do not include personal letter tools. Multiple saved plans are part of the upcoming Letter Boost.</p> : <>
      <p>{billing?.paid ? 'The Letter Boost is yours: unlimited template downloads and five AI drafts per UTC calendar month, plus multiple saved plans.' :
        'Start free with three letter downloads per UTC calendar month. The Letter Boost will add unlimited template downloads and five AI drafts per UTC calendar month, plus multiple saved plans.'}</p>
      {billing?.status && <p>Subscription status: {billing.status.replaceAll('_', ' ')}</p>}
      {!billing?.paid && billing?.accountGoal === 'personal' && billing?.checkoutEnabled && billing?.price &&
        <p>{billing.price} per month. Stripe will show the full price and terms before you pay.</p>}
      {!billing?.paid && billing?.accountGoal === 'personal' && billing?.checkoutEnabled && billing?.price &&
        !['active', 'trialing', 'past_due', 'unpaid', 'paused', 'incomplete'].includes(billing?.status ?? '') &&
        <button type="button" disabled={busy} onClick={() => goToBilling('checkout')} style={{ marginLeft: billing.hasBillingAccount ? 12 : 0 }}>
          {busy ? 'Opening checkout…' : 'Get the Letter Boost'}</button>}
      {billing?.accountGoal === 'personal' && !billing.price && !billing.paid &&
        <p>The Letter Boost is coming soon. Your free plan is ready to use.</p>}
    </>}
    {billing?.accountGoal === null && <p>Complete your assessment to see your plan options.</p>}
    {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
  </section>;
}
