"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { creditQuestions } from "@/lib/creditPlan";

const questions = creditQuestions;

export default function Questionnaire() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

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
      if (plan?.selected_disputes) setAnswers(plan.selected_disputes);
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
      Object.keys(answers).length !== questions.length ||
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
          body: JSON.stringify({ answers }),
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
        height: "100vh",
        background: "linear-gradient(135deg, #d0f0f7 0%, #ecfbfc 100%)",
        fontFamily: "'Nunito', sans-serif",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#0097A7",
            textAlign: "center",
          }}
        >
          Credit Assessment
        </h1>
        <p
          style={{
            color: "#006F7A",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Select up to <strong>3</strong> options per question to receive your best-fit credit plan.
        </p>

        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#006F7A", fontWeight: "bold" }}>{q.question}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {q.options.map((option) => {
                const isSelected = answers[q.id]?.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(q.id, option)}
                    style={{
                      padding: "10px 15px",
                      backgroundColor: isSelected ? "#0097A7" : "#D6D9E0",
                      color: isSelected ? "white" : "#1E1E1E",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
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
          <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>
            Please select at least one option per question.
          </p>
        )}
        {saveError && <p role="alert" style={{ color: "#a12323" }}>{saveError}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px 20px",
            backgroundColor: loading ? "#A0A0A0" : "#0097A7",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          {loading ? "Generating Plan..." : "Generate My Plan"}
        </button>
      </div>
    </div>
  );
}
