import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthPageShell({ mode, children }: { mode: 'sign-in' | 'sign-up'; children: ReactNode }) {
  const joining = mode === 'sign-up';
  return <div className="auth-page">
    <div className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">Your DIY credit repair workspace</p>
        <h1>{joining ? <>Save your plan. <span>Make your next move.</span></> : <>Pick up where you <span>left off.</span></>}</h1>
        <p>{joining
          ? 'Save your starting plan, prepare personal dispute letters, and manually track your next steps. You review and send every letter.'
          : 'Your plan, progress, and next step are right where you left them.'}</p>
        <div className="auth-promise"><span aria-hidden="true">✦</span> Free to start. No credit card required.</div>
        <Link className="auth-home-link" href="/">← Back to AI CreditLab</Link>
      </div>
      <div className="auth-card">
        <div className="auth-card-top"><span className="auth-card-icon" aria-hidden="true">✦</span><span>AI CREDITLAB</span></div>
        <div className="auth-clerk">{children}</div>
      </div>
    </div>
  </div>;
}
