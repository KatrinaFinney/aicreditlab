'use client';
import { useState } from 'react';
import Link from 'next/link';
import PlanLink from '@/components/PlanLink';
import { buildDisputeLetter } from '@/lib/disputeLetter';
import { trackFunnel } from '@/lib/funnel';
const examples = {
  balance: { label: 'Incorrect balance', error: 'The report shows a balance of $450, but my payment records show a balance of $0.', correction: 'correct the balance to match the supporting payment records' },
  duplicate: { label: 'Duplicate account', error: 'The same account appears twice on my report. My records show only one account with this company.', correction: 'remove the duplicate entry if your investigation confirms it is the same account' },
};
export default function PreviewPage() {
  const [example, setExample] = useState<keyof typeof examples>('balance');
  const selected = examples[example];
  const letter = buildDisputeLetter({ fullName: '[Your name]', address: '[Your mailing address]', agency: '[Selected credit bureau]', creditor: '[Company name]', accountReference: '', errorDescription: selected.error, requestedCorrection: selected.correction }, '[Date]');
  return <section className="home-container preview-page"><p className="eyebrow">Try before you sign up</p><h1>See how a dispute letter comes together.</h1><p>Choose an example to see the draft change. These are fictional facts—your letter will use the details you provide.</p><div className="preview-example-controls">{Object.entries(examples).map(([key, value]) => <button type="button" key={key} aria-pressed={example === key} onClick={() => { setExample(key as keyof typeof examples); trackFunnel('letter_preview'); }}>{value.label}</button>)}</div><div className="split-grid"><div className="glass-card preview-facts"><h2>You provide the facts.</h2><h3>What’s wrong?</h3><p>{selected.error}</p><h3>What should change?</h3><p>{selected.correction}</p><p>You’ll also enter your name, mailing address, the bureau, and the company or account involved. Don’t enter a full account number or Social Security number.</p><PlanLink className="action-button" source="letter_preview">Create my free plan</PlanLink><p className="hero-note">3 free template-letter downloads per month.</p></div><div className="glass-card letter-paper"><h2>Your draft takes shape.</h2><pre>{letter}</pre></div></div><p className="hero-note">Review every fact and add relevant supporting records before sending. This sample is not submitted, downloaded, or counted against any allowance.</p><Link href="/">Back to AI CreditLab</Link></section>;
}
