'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { letterTemplateFor, letterTemplates } from '@/lib/letterTemplates';

type Field = 'fullName' | 'address' | 'agency' | 'creditor' | 'accountReference' | 'errorDescription' | 'requestedCorrection' | 'templateId';
const initial = { fullName: '', address: '', agency: 'Equifax', creditor: '', accountReference: '', errorDescription: '', requestedCorrection: '', templateId: 'balance' };

export default function GenerateLetterForm() {
  const [values, setValues] = useState(initial);
  const [letter, setLetter] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('template');
    if (id && letterTemplateFor(id)) setValues((previous) => ({ ...previous, templateId: id }));
    fetch('/api/credit-plan').then(async (response) => {
      if (response.ok) setPaid((await response.json()).plan?.plan_type === 'paid');
    });
  }, []);
  const update = (field: Field, value: string) => setValues((previous) => ({ ...previous, [field]: value }));
  const requestLetter = async (mode: 'free' | 'paid') => {
    setBusy(true); setError(''); setLetter('');
    try {
      const response = await fetch(mode === 'paid' ? '/api/paid-letter' : '/api/generate-letter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, consent }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not create the letter');
      setLetter(result.letter);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not create the letter'); }
    finally { setBusy(false); }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); requestLetter('free'); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([letter], { type: 'text/plain' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'credit-report-dispute-draft.txt';
    anchor.click(); URL.revokeObjectURL(url);
  };
  const input = (field: Field, label: string, placeholder = '') => <label key={field} style={{ display: 'grid', gap: 6, marginBottom: 16, color: '#004E5A', fontWeight: 600 }}>
    {label}<input required={field !== 'accountReference'} maxLength={field === 'accountReference' ? 30 : 1000}
      value={values[field]} onChange={(event) => update(field, event.target.value)} placeholder={placeholder}
      style={{ padding: 12, border: '1px solid #789', borderRadius: 8, color: '#1e1e1e' }} />
  </label>;
  return <main style={{ maxWidth: 720, margin: '2rem auto', padding: '1.5rem', color: '#1e1e1e' }}>
    <Link href="/dispute-center">← Dispute Center</Link>
    <h1 style={{ color: '#006F7A', margin: '24px 0 12px' }}>Draft a credit report dispute letter</h1>
    <p>Use this only for information you believe is inaccurate. This tool prepares a draft for you to review; it does not send a dispute or guarantee an outcome.</p>
    <form id="letter-form" onSubmit={submit} style={{ background: '#ecfbfc', padding: 24, borderRadius: 12, marginTop: 24 }}>
      <label style={{ display: 'grid', gap: 6, marginBottom: 16, color: '#004E5A' }}>Letter template
        <select value={values.templateId} onChange={(event) => update('templateId', event.target.value)} style={{ padding: 12 }}>
          {letterTemplates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}
        </select>
        <small>{letterTemplateFor(values.templateId)?.guidance}</small>
      </label>
      {input('fullName', 'Your full name')}
      {input('address', 'Your mailing address', 'Street, city, state, ZIP')}
      <label style={{ display: 'grid', gap: 6, marginBottom: 16, color: '#004E5A' }}>Credit bureau
        <select value={values.agency} onChange={(event) => update('agency', event.target.value)} style={{ padding: 12 }}>
          <option>Equifax</option><option>Experian</option><option>TransUnion</option>
        </select>
      </label>
      {input('creditor', values.templateId === 'personal' ? 'Report item (enter Personal information)' : 'Company or account name')}
      {input('accountReference', 'Account reference (optional)', 'Only the last four digits if helpful')}
      <label style={{ display: 'grid', gap: 6, marginBottom: 16, color: '#004E5A' }}>What exactly is wrong?
        <textarea required maxLength={1000} rows={4} value={values.errorDescription}
          onChange={(event) => update('errorDescription', event.target.value)} style={{ padding: 12 }} />
      </label>
      {input('requestedCorrection', 'What correction are you requesting?', 'For example: correct the reported balance to $...')}
      <button disabled={busy} style={{ padding: '12px 20px', background: '#0097A7', color: 'white', border: 0, borderRadius: 8 }}>
        {busy ? 'Preparing…' : 'Create free template draft'}
      </button>
      {paid && <div style={{ marginTop: 20, borderTop: '1px solid #9cc', paddingTop: 18 }}>
        <p><strong>Paid plan: tailored AI draft</strong></p>
        <p>Your entered details will be sent to OpenAI to draft this letter. Do not enter a full account number or other information you do not want processed. Review every fact before sending.</p>
        <label style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          I agree to send the details above to OpenAI for this draft.
        </label>
        <button type="button" disabled={busy || !consent} onClick={() => {
          const form = document.getElementById('letter-form') as HTMLFormElement;
          if (form.reportValidity()) requestLetter('paid');
        }} style={{ padding: '12px 20px', background: '#006F7A', color: 'white', border: 0, borderRadius: 8 }}>
          Generate tailored AI draft
        </button>
      </div>}
    </form>
    {error && <p role="alert" style={{ color: '#a12323' }}>{error}</p>}
    {letter && <section style={{ marginTop: 24 }}><h2>Review your draft</h2>
      <p>Check all facts and add copies of supporting records before sending.</p>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f2f8f8', padding: 20, borderRadius: 8, fontFamily: 'inherit' }}>{letter}</pre>
      <button onClick={download} style={{ padding: '12px 20px', background: '#006F7A', color: 'white', border: 0, borderRadius: 8 }}>Download draft</button>
    </section>}
  </main>;
}
