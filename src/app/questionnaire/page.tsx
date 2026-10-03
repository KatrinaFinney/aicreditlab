'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { businessQuestions, creditQuestions, generateCreditPlan, isValidCreditAnswers, type CreditAnswers, type CreditGoal } from '@/lib/creditPlan';
import { PLAN_DRAFT_KEY, readPlanDraft } from '@/lib/planDraft';
import { trackFunnel } from '@/lib/funnel';

export default function Questionnaire() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [goal, setGoal] = useState<CreditGoal | null>(null);
  const [answers, setAnswers] = useState<CreditAnswers>({});
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [restoredOwner, setRestoredOwner] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [newPlan, setNewPlan] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const questions = goal === 'business' ? businessQuestions : creditQuestions;
  const question = questions[step - 1];
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    setReady(false);
    const creating = new URLSearchParams(window.location.search).get('new') === '1';
    setNewPlan(creating);
    async function restore() {
      let draft = null;
      try { draft = readPlanDraft(sessionStorage.getItem(PLAN_DRAFT_KEY), userId); } catch { /* Use the questionnaire without storage. */ }
      if (draft && !!draft.newPlan === creating) {
        setGoal(draft.goal); setAnswers(draft.answers); setStep(draft.step);
      } else {
        setGoal(null); setAnswers({}); setStep(0);
        if (userId && !creating) {
          try {
            const response = await fetch('/api/credit-plan');
            if (response.ok) {
              const { plan } = await response.json();
              if (!cancelled && ['personal', 'business'].includes(plan?.account_goal) && isValidCreditAnswers(plan?.selected_disputes, plan.account_goal)) {
                setGoal(plan.account_goal); setAnswers(plan.selected_disputes); setStep(4);
              }
            }
          } catch { /* A saved-plan fetch must not prevent starting a plan. */ }
        }
      }
      if (!cancelled) { setRestoredOwner(userId); setReady(true); }
    }
    void restore();
    return () => { cancelled = true; };
  }, [isLoaded, userId]);

  useEffect(() => {
    if (!ready || restoredOwner !== userId || !goal) return;
    try { sessionStorage.setItem(PLAN_DRAFT_KEY, JSON.stringify({ version: 1, owner: userId, goal, answers, step, newPlan, updatedAt: Date.now() })); } catch { /* Storage is optional. */ }
  }, [ready, restoredOwner, goal, answers, step, newPlan, userId]);

  function go(next: number) {
    setStep(next); setError('');
    requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start', behavior: 'auto' }); });
  }
  function next() {
    if (!goal || (step > 0 && !answers[question.id]?.length)) { setError('Choose at least one option to continue.'); return; }
    if (step === 3) trackFunnel('plan_preview');
    go(step + 1);
  }
  function choose(option: string) {
    const selected = answers[question.id] ?? [];
    if (!selected.includes(option) && selected.length >= 3) {
      setError('Choose up to three options. Unselect one to choose another.'); return;
    }
    setError('');
    setAnswers(previous => ({ ...previous, [question.id]: selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option] }));
  }
  async function save() {
    if (!goal || !isValidCreditAnswers(answers, goal)) { go(0); return; }
    if (!user) {
      try { sessionStorage.setItem('creditlab-signup-pending', '1'); } catch { /* Optional analytics marker. */ }
      trackFunnel('signup_started');
      router.push('/sign-up?redirect_url=%2Fquestionnaire'); return;
    }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/credit-plan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, goal, newPlan }) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.error || 'We couldn’t save your plan. Please try again.'); return;
      }
      try { sessionStorage.removeItem(PLAN_DRAFT_KEY); } catch { /* Optional storage. */ }
      trackFunnel('plan_saved'); router.push('/dashboard');
    } catch { setError('We couldn’t save your plan. Your answers are still here—please try again.'); }
    finally { setBusy(false); }
  }
  if (!isLoaded || !ready || restoredOwner !== userId) return <p className="loading-copy" role="status">Preparing your plan…</p>;
  return <section className="plan-builder home-container">
    <div className="glass-card wizard-card">
      <p className="eyebrow">{step === 0 ? 'Start with your goal' : step === 4 ? 'Your plan preview' : `Question ${step} of 3`}</p>
      <progress aria-label="Plan progress" max={4} value={step} />
      <h1 tabIndex={-1} ref={heading}>{step === 0 ? 'What would you like to work on?' : step === 4 ? 'Your next steps, simplified.' : question.question}</h1>
      {step === 0 ? <><p>Choose a path. Answer three short questions. Preview your plan before creating an account.</p><div className="goal-grid">{(['personal', 'business'] as const).map(choice => <button key={choice} type="button" aria-pressed={goal === choice} className="goal-choice" onClick={() => { if (choice !== goal) { setGoal(choice); setAnswers({}); } setError(''); }}><strong>{choice === 'personal' ? 'Personal credit' : 'Business credit'}</strong><span>{choice === 'personal' ? 'Address report errors, balances, and credit habits.' : 'Build business credit and organize your next steps.'}</span></button>)}</div><p className="hero-note">No credit card or credit report upload required.</p></> : step === 4 ? <><p>{goal === 'business' ? 'A starting point for building your business credit. Personal dispute letters follow a separate path.' : 'Based on your answers, here are practical steps to focus on first.'}</p><ol className="plan-preview-list">{generateCreditPlan(answers, goal ?? 'personal').map(item => <li key={item}>{item}</li>)}</ol><p className="hero-note">{user ? 'Save this plan to track your progress in your workspace.' : 'Create a free account to save this plan and track your progress.'}</p><button type="button" className="action-button" onClick={save} disabled={busy}>{busy ? 'Saving your plan…' : user ? 'Save my plan' : 'Create account & save my plan'}</button>{!user && <p>Already have an account? <Link href="/sign-in?redirect_url=%2Fquestionnaire">Sign in to save your plan</Link>.</p>}</> : <><p>Select up to three answers that fit. You can change them later.</p><div className="answer-grid">{question.options.map(option => <button key={option} type="button" aria-pressed={answers[question.id]?.includes(option) ?? false} onClick={() => choose(option)}>{option}</button>)}</div></>}
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="wizard-actions">{step > 0 && <button type="button" onClick={() => go(step - 1)} disabled={busy}>Back</button>}{step < 4 && <button type="button" className="action-button" onClick={next}>{step === 3 ? 'Preview my plan' : 'Continue'}</button>}</div>
      <p className="hero-note">Your choices are used to create your plan. <Link href="/privacy">How your information is used</Link>.</p>
    </div>
  </section>;
}
