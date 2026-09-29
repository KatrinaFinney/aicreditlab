"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

// Define a type for the user's credit plan data
interface UserData {
  plan_type: "free" | "paid";
  active_saved_plan_id?: string;
  account_goal?: "personal" | "business";
  full_name?: string;
  address?: string;
  selected_disputes?: Record<string, string[]>;
  credit_plan?: string[];
}
type SavedPlan = { id: string; account_goal: "personal" | "business"; created_at: string };

export default function Dashboard() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [planError, setPlanError] = useState('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progressError, setProgressError] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    
    if (!user) return;


    const fetchUserPlan = async () => {
      const response = await fetch('/api/credit-plan');
      if (!response.ok) return;
      const { plan: data, savedPlans: plans } = await response.json();



      if (data) {
        setUserData(data);
        setSavedPlans(plans ?? []);
      }
    };

    fetchUserPlan();
    fetch('/api/credit-progress').then(async (response) => {
      if (response.ok) {
        const progress = await response.json();
        setCompletedSteps(progress.completedSteps);
        setFocusMode(progress.focusMode);
        setSessionMinutes(progress.sessionMinutes);
        setSecondsLeft(progress.sessionMinutes * 60);
      } else setProgressError('Could not load saved progress.');
    });
  }, [user]);

  const openPlan = async (id: string) => {
    setPlanError('');
    try {
      const response = await fetch('/api/credit-plan', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error('Switch failed');
      // Reload the active plan and its saved progress together.
      window.location.reload();
    } catch { setPlanError('Could not open that plan. Please try again.'); }
  };

  useEffect(() => {
    if (!timerRunning || secondsLeft === 0) return;
    const id = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, secondsLeft]);

  useEffect(() => { if (secondsLeft === 0) setTimerRunning(false); }, [secondsLeft]);

  const savePreferences = async (nextFocus: boolean, nextMinutes: number) => {
    setProgressError('');
    try {
      const response = await fetch('/api/credit-progress', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusMode: nextFocus, sessionMinutes: nextMinutes }),
      });
      if (!response.ok) throw new Error('Save failed');
      setFocusMode(nextFocus); setSessionMinutes(nextMinutes); setSecondsLeft(nextMinutes * 60); setTimerRunning(false);
    } catch { setProgressError('Could not save your focus settings. Please try again.'); }
  };

  const updateProgress = async (step: string, completed: boolean) => {
    setProgressError('');
    try {
      const response = await fetch('/api/credit-progress', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, completed }),
      });
      if (!response.ok) throw new Error('Save failed');
      setCompletedSteps((await response.json()).completedSteps);
    } catch {
      setProgressError('Could not save your progress. Please try again.');
    }
  };

  return (
    <div className="app-dashboard"
      style={{
        padding: "clamp(20px, 4vw, 48px)",
        maxWidth: "1100px",
        margin: "auto",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        backgroundColor: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      {/* Welcome Section */}
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          color: "var(--accent)",
          textAlign: "center",
        }}
      >
       Welcome, {userData?.full_name || user?.fullName || user?.firstName}!

      </h1>

      <p style={{ textAlign: "center", fontSize: "1.2rem", color: "var(--text)" }}>
        Pick one action to work on next. Your completed steps are saved here.
      </p>

      {userData?.plan_type === 'paid' && <section style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, border: '1px solid var(--line)' }}>
        <h2 style={{ color: 'var(--accent)' }}>Your saved plans</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {savedPlans.map((plan, index) => <button key={plan.id} type="button"
            disabled={plan.id === userData.active_saved_plan_id} onClick={() => openPlan(plan.id)}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--accent)', background: 'var(--surface-raised)', color: 'var(--text)' }}>
            {plan.account_goal === 'business' ? 'Business' : 'Personal'} plan {index + 1}{plan.id === userData.active_saved_plan_id ? ' · Current' : ''}
          </button>)}
          <Link href="/questionnaire?new=1" style={{ padding: '10px 14px', color: 'var(--accent)' }}>+ Create another plan</Link>
        </div>
        {planError && <p role="alert" style={{ color: 'var(--danger)' }}>{planError}</p>}
      </section>}

      {/* Credit Plan Overview */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--line)",
          marginTop: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--accent)",
          }}
        >
          Your {userData?.account_goal === "business" ? "Business" : "Personal"} Credit Action Plan
        </h2>

        {userData?.credit_plan && userData.credit_plan.length > 0 ? (
          <div>
            <p role="status" style={{ color: 'var(--accent)' }}>
              Current progress: {completedSteps.filter((step) => userData.credit_plan?.includes(step)).length} of {userData.credit_plan.length} steps complete
            </p>
            <p style={{ color: 'var(--text)', fontWeight: 600 }}>
              Next best step: {userData.credit_plan.find((step) => !completedSteps.includes(step)) ?? 'You completed this plan. Review your credit situation and update your answers when needed.'}
            </p>
            <div style={{ background: 'var(--surface-raised)', padding: 16, borderRadius: 10, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={focusMode} onChange={(event) => savePreferences(event.target.checked, sessionMinutes)} />
                Show one step at a time
              </label>
              <p style={{ margin: '12px 0 6px' }}>How much time do you have right now?</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5, 10, 20].map((minutes) => <button key={minutes} type="button"
                  onClick={() => savePreferences(focusMode, minutes)} aria-pressed={sessionMinutes === minutes}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--accent-strong)', background: sessionMinutes === minutes ? 'var(--accent-strong)' : 'var(--surface)', color: sessionMinutes === minutes ? 'white' : 'var(--accent)' }}>
                  {minutes} min
                </button>)}
              </div>
              <p style={{ margin: '12px 0 6px' }}>Focus timer: {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</p>
              <button type="button" onClick={() => { if (secondsLeft === 0) setSecondsLeft(sessionMinutes * 60); setTimerRunning(!timerRunning); }}
                style={{ padding: '8px 12px', marginRight: 8 }}>{timerRunning ? 'Pause' : 'Start'}</button>
              <button type="button" onClick={() => { setTimerRunning(false); setSecondsLeft(sessionMinutes * 60); }} style={{ padding: '8px 12px' }}>Reset</button>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>You can stop whenever you need to. Mark the step done when you have actually finished it.</p>
            </div>
          <ul style={{ paddingLeft: "20px", marginTop: "10px", listStyle: 'none' }}>
            {(focusMode ? userData.credit_plan.filter((step) => !completedSteps.includes(step)).slice(0, 1) : userData.credit_plan).map((step, index) => (
              <li
                key={index}
                style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "8px" }}
              >
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={completedSteps.includes(step)}
                    onChange={(event) => updateProgress(step, event.target.checked)}
                    aria-label={`Mark step ${index + 1} complete`} />
                  <span style={{ textDecoration: completedSteps.includes(step) ? 'line-through' : 'none' }}>{step}</span>
                </label>
              </li>
            ))}
          </ul>
          {progressError && <p role="alert" style={{ color: 'var(--danger)' }}>{progressError}</p>}
          </div>
        ) : (
          <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
            No credit plan found. Please complete the questionnaire.
          </p>
        )}

        <Link
          href="/questionnaire"
          style={{
            display: "inline-block",
            marginTop: "12px",
            padding: "10px 16px",
            backgroundColor: "var(--accent-strong)",
            color: "#071d25",
            fontWeight: "bold",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          {userData?.plan_type === 'paid' ? 'Edit This Plan' : 'Update Your Plan'}
        </Link>
      </div>

      {/* Assessment answers */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--line)",
          marginTop: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--accent)",
          }}
        >
          Your {userData?.account_goal === "business" ? "Business" : "Personal"} Credit Assessment
        </h2>

        {userData?.selected_disputes && Object.values(userData.selected_disputes).flat().length > 0 ? (
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            {Object.values(userData.selected_disputes).flat().map((answer, index) => (
              <li
                key={index}
                style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "8px" }}
              >
                {answer}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
            Complete the assessment to see your answers here.
          </p>
        )}
      </div>

      {/* Dispute Center Section */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--line)",
          marginTop: "24px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)" }}>
          {userData?.account_goal === "business" ? "Business report review" : "Dispute Center"}
        </h2>
        <p style={{ fontSize: "1.1rem", color: "var(--text)" }}>
          {userData?.account_goal === "business" ? "Request your business report from the reporting company. If you find a specific error, follow that company’s business dispute process and keep copies of your supporting records. The letter library below is designed for personal consumer reports." : "Review dispute templates for information you believe is inaccurate on your credit report."}
        </p>

        {userData?.account_goal !== "business" && <Link
          href="/dispute-center"
          style={{
            display: "inline-block",
            marginTop: "12px",
            padding: "10px 16px",
            backgroundColor: "var(--accent-strong)",
            color: "#071d25",
            fontWeight: "bold",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Access Dispute Templates
        </Link>}
      </div>

      {/* Paid features are planned; no checkout is available yet. */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--line)",
          marginTop: "24px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent)" }}>
          Premium Tools
        </h2>
        <p style={{ fontSize: "1.1rem", color: "var(--text)" }}>
          Paid accounts can save multiple plans, use unlimited template downloads, and generate five AI letters per month. Billing and self-service upgrades are in development.
        </p>

        <p style={{ color: "var(--accent)" }}>More guided tools are in development.</p>
      </div>
    </div>
  );
}
