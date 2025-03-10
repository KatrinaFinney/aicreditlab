"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const questions = [
  {
    id: 1,
    question: "What is your biggest credit challenge?",
    options: [
      "Late payments",
      "High credit utilization",
      "Collections",
      "No credit history",
      "Errors on my report",
    ],
  },
  {
    id: 2,
    question: "What is your primary goal?",
    options: [
      "Increase credit score",
      "Remove negative items",
      "Get approved for a loan",
      "Improve financial habits",
      "Lower interest rates",
    ],
  },
  {
    id: 3,
    question: "Which best describes your current financial habits?",
    options: [
      "I budget carefully",
      "I sometimes overspend",
      "I live paycheck to paycheck",
      "I have savings but struggle with credit",
      "I don’t check my credit often",
    ],
  },
];

export default function Questionnaire() {
  const router = useRouter();
  const { user } = useUser();
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];

      if (currentAnswers.includes(option)) {
        return { ...prev, [questionId]: currentAnswers.filter((ans) => ans !== option) };
      } else if (currentAnswers.length < 3) {
        return { ...prev, [questionId]: [...currentAnswers, option] };
      }
      return prev;
    });

    setError(false); // Remove error message when a valid selection is made
  };

  const handleSubmit = async () => {
    // Ensure all questions have at least one selection
    if (Object.keys(answers).length !== questions.length || Object.values(answers).some(ans => ans.length === 0)) {
      setError(true);
      return;
    }

    setLoading(true);

    // Save to Supabase
    if (user) {
      const { error } = await supabase
        .from("credit_plans")
        .update({ selected_disputes: answers })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving responses:", error);
      }
    }

    router.push("/dashboard");
  };

  return (
    <div style={{ padding: "32px", textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#0097A7" }}>Credit Assessment</h1>
      <p style={{ color: "#006F7A", marginBottom: "20px" }}>
        Select up to <strong>3</strong> options per question to get your best-fit credit plan.
      </p>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#006F7A", fontWeight: "bold" }}>{q.question}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", justifyContent: "center" }}>
            {q.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(q.id, option)}
                style={{
                  padding: "10px 15px",
                  backgroundColor: answers[q.id]?.includes(option) ? "#0097A7" : "#D6D9E0",
                  color: answers[q.id]?.includes(option) ? "white" : "#1E1E1E",
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
            ))}
          </div>
        </div>
      ))}

      {error && <p style={{ color: "red", fontWeight: "bold" }}>Please select at least one option per question.</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
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
  );
}
