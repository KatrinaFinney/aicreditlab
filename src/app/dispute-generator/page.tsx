'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { letterTemplateFor, letterTemplates } from '@/lib/letterTemplates';
import { buildDisputeLetter } from '@/lib/disputeLetter';

type Field = 'fullName' | 'address' | 'agency' | 'creditor' | 'accountReference' | 'errorDescription' | 'requestedCorrection' | 'templateId';
type Allowance = { accountGoal: "personal" | "business"; paid: boolean; used: number; limit: number; remaining: number; resetAt: string };
const initial = { fullName: '', address: '', agency: 'Equifax', creditor: '', accountReference: '', errorDescription: '', requestedCorrection: '', templateId: 'wrong-balance' };

export default function LetterEditor() {
  const [values, setValues] = useState(initial);
  const [letter, setLetter] = useState('');
  const [source, setSource] = useState<'template' | 'ai'>('template');
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const refreshAllowance = async () => {
    const response = await fetch('/api/letter-usage');
    if (!response.ok) throw new Error('Could not check your letter allowance');
    setAllowance(await response.json());
  };
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('template');
    if (id && letterTemplateFor(id)) setValues((previous) => ({ ...previous, templateId: id }));
    refreshAllowance().catch(() => setError('Could not check your letter allowance. Please try again later.'));
  }, []);
  const update = (field: Field, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value })); setLetter('');
  };
  const preview = (event: FormEvent) => {
    event.preventDefault(); setError('');
    setLetter(buildDisputeLetter(values, new Date().toLocaleDateString('en-US'))); setSource('template');
  };
  const aiDraft = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/paid-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, consent }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not generate a draft');
      setLetter(result.letter); setSource('ai');
      await refreshAllowance();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not generate a draft'); }
    finally { setBusy(false); }
  };
  const saveFile = (content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'credit-report-dispute-draft.txt';
    anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const download = async () => {
    if (!letter || !allowance) return;
    setBusy(true); setError('');
    try {
      if (source === 'ai') saveFile(letter);
      else {
        const response = await fetch('/api/letter-download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        if (!response.ok) {
          const result = await response.json(); throw new Error(result.error ?? 'Could not download your draft');
        }
        saveFile(await response.text());
        await refreshAllowance();
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not download your draft'); }
    finally { setBusy(false); }
  };
  const locked = !!allowance && !allowance.paid && allowance.remaining === 0;
  if (allowance?.accountGoal === "business") return <main style={{ maxWidth: 720, margin: "2rem auto", padding: 24 }}><h1>Business reports need a different playbook</h1><p>This editor is for personal credit reports. For a business report mistake, follow the reporting company’s dispute process.</p><Link href="/dashboard">Back to my business game plan</Link></main>;
  const input = (field: Field, label: string, placeholder = '') => <label key={field} style={{ display: 'grid', gap: 6, marginBottom: 16, color: 'var(--text)', fontWeight: 600 }}>
    {label}<input required={field !== 'accountReference'} maxLength={field === 'accountReference' ? 30 : 1000}
      value={values[field]} onChange={(event) => update(field, event.target.value)} placeholder={placeholder}
      style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)' }} />
  </label>;
  return <main style={{ maxWidth: 720, margin: '2rem auto', padding: '1.5rem', color: 'var(--text)' }}>
    <Link href="/dispute-center">← Back to the Letter Lab</Link>
    <h1 style={{ color: 'var(--accent)', margin: '24px 0 12px' }}>Make this letter yours.</h1>
    <p>Start with a real error on your personal credit report. Tell us what looks wrong and what your records show. You review the draft and include supporting copies when you send it.</p>
    {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
    {allowance && <p role="status" style={{ color: 'var(--accent)', fontWeight: 700 }}>
      {allowance.paid ? `Unlimited template downloads · ${allowance.remaining} of 5 AI generations left this month` :
        `${allowance.remaining} of 3 free downloads left this month`}
      {' · '}Resets {new Date(allowance.resetAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} (UTC)
    </p>}
    {locked ? <div className="glass-card" style={{ padding: 24, }}>
      <h2>Your free downloads are tapped out for now</h2>
      <p>You’ve used your three free downloads. They reset at the start of the next UTC month.</p>
    </div> : !allowance ? <p>Checking letter access…</p> : <>
      <form id="letter-form" onSubmit={preview} className="glass-card" style={{ padding: 24, marginTop: 24 }}>
        <label style={{ display: 'grid', gap: 6, marginBottom: 16, color: 'var(--text)' }}>Letter topic
          <select value={values.templateId} onChange={(event) => update('templateId', event.target.value)} style={{ padding: 12 }}>
            {letterTemplates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}
          </select><small>{letterTemplateFor(values.templateId)?.guidance}</small>
        </label>
        {input('fullName', 'Your full name')}
        {input('address', 'Your mailing address', 'Street, city, state, ZIP')}
        <label style={{ display: 'grid', gap: 6, marginBottom: 16, color: 'var(--text)' }}>Credit bureau
          <select value={values.agency} onChange={(event) => update('agency', event.target.value)} style={{ padding: 12 }}>
            <option>Equifax</option><option>Experian</option><option>TransUnion</option>
          </select>
        </label>
        {input('creditor', letterTemplateFor(values.templateId)?.category === 'Identity' ? 'Report item or company name' : 'Company or account name')}
        {input('accountReference', 'Account reference (optional)', 'Only the last four digits if helpful')}
        <label style={{ display: 'grid', gap: 6, marginBottom: 16, color: 'var(--text)' }}>What exactly is wrong?
          <textarea required maxLength={1000} rows={4} value={values.errorDescription}
            onChange={(event) => update('errorDescription', event.target.value)} style={{ padding: 12 }} />
        </label>
        {input('requestedCorrection', 'What correction are you requesting?', 'For example: correct the reported balance to $…')}
        <button disabled={busy} style={{ padding: '12px 20px', background: 'var(--accent-strong)', color: '#071d25', border: 0, borderRadius: 8 }}>Preview my letter</button>
        {allowance.paid && <div style={{ marginTop: 20, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
          <p><strong>Want an AI-assisted first draft? ({allowance.remaining} left this month)</strong></p>
          <p>Your entered details will be sent to OpenAI. Use only an account reference of up to eight characters. Review every fact before sending.</p>
          <label style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            I agree to send the details above to OpenAI for this draft.
          </label>
          <button type="button" disabled={busy || !consent || allowance.remaining === 0} onClick={() => {
            const form = document.getElementById('letter-form') as HTMLFormElement;
            if (form.reportValidity()) aiDraft();
          }} style={{ padding: '12px 20px', background: 'var(--accent)', color: '#071d25', border: 0, borderRadius: 8 }}>Draft with AI</button>
        </div>}
      </form>
      {letter && <section className="glass-card" style={{ marginTop: 24, padding: 24 }}><h2>One last look before you send</h2>
        <p>Check every fact. Add the bureau’s current mailing address, your report confirmation number if available, and copies of supporting documents before sending.</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--surface-raised)', padding: 20, borderRadius: 8, fontFamily: 'inherit', color: 'var(--text)'  }}>{letter}</pre>
        <button disabled={busy} onClick={download} style={{ padding: '12px 20px', background: 'var(--accent)', color: '#071d25', border: 0, borderRadius: 8 }}>Download letter</button>
      </section>}
    </>}
  </main>;
}
