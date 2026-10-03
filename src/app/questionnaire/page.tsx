"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { businessQuestions, creditQuestions, type CreditGoal } from "@/lib/creditPlan";



export default function Questionnaire() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [goal, setGoal] = useState<CreditGoal | null>(null);
  const questions = goal === "business" ? businessQuestions : creditQuestions;
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [newPlan, setNewPlan] = useState(false);

  useEffect(() => { setNewPlan(new URLSearchParams(window.location.search).get('new') === '1'); }, []);

  // 🔹 Redirect to sign-up if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-up?redirect=questionnaire");
    }
  }, [user, isLoaded, router]);

  // 🔹 Fetch existing questionnaire data
  useEffect(() => {
    if (!user) return;

    const fetchExistingData = async () => {
      const response = await fetch('/api/credit-plan');
      if (!response.ok) return;
      const { plan } = await response.json();
      if (new URLSearchParams(window.location.search).get('new') === '1' && plan?.plan_type === 'paid') return;
      if (plan?.selected_disputes) setAnswers(plan.selected_disputes);
      if (plan?.account_goal === "business" || plan?.account_goal === "personal") setGoal(plan.account_goal);
    };

    fetchExistingData();
  }, [user, router]);

  // 🔹 Handle selecting options (max 3 per question)
  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (currentAnswers.includes(option)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((ans) => ans !== option),
        };
      } else if (currentAnswers.length < 3) {
        return { ...prev, [questionId]: [...currentAnswers, option] };
      }
      return prev;
    });

    setError(false);
  };

  // 🔹 Submit questionnaire and save responses
  const handleSubmit = async () => {
    if (
      !goal || Object.keys(answers).length !== questions.length ||
      Object.values(answers).some((ans) => ans.length === 0)
    ) {
      setError(true);
      return;
    }

    setLoading(true);
    if (user) {
      setSaveError("");
      try {
        const response = await fetch('/api/credit-plan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, goal, newPlan }),
        });
        if (!response.ok) {
          setSaveError("We couldn't save your plan. Please try again.");
        } else {
          router.push('/dashboard');
        }
      } catch {
        setSaveError("We couldn't save your plan. Please try again.");
      }
    }
    setLoading(false);
  };

  // 🔹 Show loading state while Clerk loads
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "transparent",
        fontFamily: "inherit",
        padding: "1rem",
      }}
    >
      <div
        className="glass-card" style={{
          border: "1px solid var(--line)",
          padding: "30px",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "var(--accent)",
            textAlign: "center",
          }}
        >
          {newPlan ? "Make another game plan" : goal === "business" ? "Let’s build your business credit game plan" : goal === "personal" ? "Let’s build your credit game plan" : "Let’s get a game plan together"}
        </h1>
        <p
          style={{
            color: "var(--accent)",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          First, tell us where you’re starting. Then pick up to <strong>3</strong> answers for each question. No perfect answers needed.
        </p>

        <fieldset style={{ border: "1px solid var(--line)", borderRadius: 10, marginBottom: 24, padding: 16 }}>
          <legend style={{ color: "var(--accent)", fontWeight: 700 }}>What’s the move: work on your personal credit or build business credit?</legend>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["personal", "business"] as const).map((choice) => <button type="button" key={choice} aria-pressed={goal === choice}
              onClick={() => { if (goal !== choice) { setGoal(choice); setAnswers({}); setError(false); } }}
              style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid var(--accent)", background: goal === choice ? "var(--accent-strong)" : "var(--surface-raised)", color: goal === choice ? "#071d25" : "var(--text)" }}>
              {choice === "personal" ? "Personal credit" : "Business credit"}
            </button>)}
          </div>
        </fieldset>
        {goal === "business" && <p style={{ color: "var(--muted)" }}>Business credit plays by different reporting rules. We’ll focus on your business setup, payment history, and financing goals—not personal dispute letters.</p>}
        {goal && questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "var(--accent)", fontWeight: "bold" }}>{q.question}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "10px" }}>
              {q.options.map((option) => {
                const isSelected = answers[q.id]?.includes(option);
                return (
                  <button
                    key={option}
                    aria-pressed={!!isSelected}
                    onClick={() => handleSelect(q.id, option)}
                    style={{
                      padding: "10px 15px",
                      backgroundColor: isSelected ? "var(--accent-strong)" : "var(--surface-raised)",
                      color: isSelected ? "#071d25" : "var(--text)",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {error && (
          <p style={{ color: "var(--danger)", fontWeight: "bold", textAlign: "center" }}>
            Choose a credit path and at least one option per question.
          </p>
        )}
        {saveError && <p role="alert" style={{ color: "var(--danger)" }}>{saveError}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px 20px",
            backgroundColor: loading ? "#A0A0A0" : "var(--accent-strong)",
            color: "#071d25",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          {loading ? "Saving your game plan…" : newPlan ? "Save my new game plan" : "Save my game plan"}
        </button>
      </div>
    </div>
  );
}
