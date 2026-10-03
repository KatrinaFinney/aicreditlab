import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthPageShell({ mode, children }: { mode: 'sign-in' | 'sign-up'; children: ReactNode }) {
  const joining = mode === 'sign-up';
  return <div className="auth-page">
    <div className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">Your credit, your next move</p>
        <h1>{joining ? <>Let’s get a <span>game plan</span> together.</> : <>Pick up where you <span>left off.</span></>}</h1>
        <p>{joining
          ? 'A few quick questions. A clear starting point. Your personal or business credit plan is waiting.'
          : 'Your plan, progress, and next step are right where you left them.'}</p>
        <div className="auth-promise"><span aria-hidden="true">✦</span> One move at a time. No 47 open tabs.</div>
        <Link className="auth-home-link" href="/">← Back to AI CreditLab</Link>
      </div>
      <div className="auth-card">
        <div className="auth-card-top"><span className="auth-card-icon" aria-hidden="true">✦</span><span>AI CREDITLAB</span></div>
        <div className="auth-clerk">{children}</div>
      </div>
    </div>
  </div>;
}
