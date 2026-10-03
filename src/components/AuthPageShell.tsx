import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthPageShell({ mode, children }: { mode: 'sign-in' | 'sign-up'; children: ReactNode }) {
  const joining = mode === 'sign-up';
  return <div className="auth-page">
    <div className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">Your free credit workspace</p>
        <h1>{joining ? <>Save your plan. <span>Start making progress.</span></> : <>Pick up where you <span>left off.</span></>}</h1>
        <p>{joining
          ? 'Create your free account to save your plan, track your steps, and access dispute letter templates.'
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
