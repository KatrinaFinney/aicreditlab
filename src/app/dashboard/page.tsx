"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import BillingCard from '@/components/BillingCard';

// Define a type for the user's credit plan data
interface UserData {
  plan_type: "free" | "paid";
  account_goal?: "personal" | "business";
  full_name?: string;
  address?: string;
  selected_disputes?: Record<string, string[]>;
  credit_plan?: string[];
}

export default function Dashboard() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
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
      const { plan: data } = await response.json();



      if (data) {
        setUserData(data);
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
       Hey, {userData?.full_name || user?.fullName || user?.firstName || 'there'}.

      </h1>

      <p style={{ textAlign: "center", fontSize: "1.2rem", color: "var(--text)" }}>
        You’ve got a plan. Pick one move for today—we’ll keep track of the rest.
      </p>

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
          Your {userData?.account_goal === "business" ? "business" : "personal"} credit game plan
        </h2>

        {userData?.credit_plan && userData.credit_plan.length > 0 ? (
          <div>
            <p role="status" style={{ color: 'var(--accent)' }}>
              You’ve made {completedSteps.filter((step) => userData.credit_plan?.includes(step)).length} of {userData.credit_plan.length} moves
            </p>
            <p style={{ color: 'var(--text)', fontWeight: 600 }}>
              Up next: {userData.credit_plan.find((step) => !completedSteps.includes(step)) ?? 'You finished this plan. Check in on your credit situation and update your answers when things change.'}
            </p>
            <div style={{ background: 'var(--surface-raised)', padding: 16, borderRadius: 10, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={focusMode} onChange={(event) => savePreferences(event.target.checked, sessionMinutes)} />
                Just show me the next step
              </label>
              <p style={{ margin: '12px 0 6px' }}>Got a few minutes?</p>
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
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>Stop whenever you need to. Check off a step only when it’s actually done.</p>
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
            No game plan yet. Answer a few quick questions to make yours.
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
          Refresh my game plan
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
          Your {userData?.account_goal === "business" ? "business" : "personal"} credit snapshot
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
            Once you answer the quick questions, your starting point will show up here.
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
          {userData?.account_goal === "business" ? "Check your business reports" : "The Letter Lab"}
        </h2>
        <p style={{ fontSize: "1.1rem", color: "var(--text)" }}>
          {userData?.account_goal === "business" ? "Get your business report from the reporting company. Spot a specific mistake? Follow that company's business dispute process and save copies of your records. Personal letter tools aren't built for business reports." : "Spot something wrong on a personal credit report? Find a letter starting point, add your facts, and review it before you send it."}
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
          Open the Letter Lab
        </Link>}
      </div>

      <BillingCard />
    </div>
  );
}
