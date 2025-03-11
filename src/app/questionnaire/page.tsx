"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Questionnaire data
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
      "Too many inquiries",
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
      "Build business credit",
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
      "I make payments but carry high balances",
    ],
  },
];

export default function Questionnaire() {
  const router = useRouter();
  const { user } = useUser();
  const [answers, setAnswers] = useState<{ [key: number]: string[] }>({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  // ─────────────────────────────────────────────────────────
  // ADDED: Fetch existing answers from Supabase on page load
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const fetchExistingData = async () => {
      const { data, error } = await supabase
        .from("credit_plans")
        .select("selected_disputes, questionnaire_completed")
        .eq("user_id", user.id)
        .single();

      // If there's a record, set answers & completion status
      if (!error && data) {
        if (data.selected_disputes) {
          setAnswers(data.selected_disputes); // or JSON.parse(...) if stored as JSON
        }
        if (data.questionnaire_completed) {
          setQuestionnaireCompleted(true);
          router.push("/dashboard"); // If already completed, redirect
        }
      }
    };

    fetchExistingData();
  }, [user, router]);

  // Keep the existing logic to check questionnaire status
  useEffect(() => {
    if (!user) return;

    const checkQuestionnaireStatus = async () => {
      const { data, error } = await supabase
        .from("credit_plans")
        .select("questionnaire_completed")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.questionnaire_completed) {
        setQuestionnaireCompleted(true);
        router.push("/dashboard"); // Redirect if already completed
      }
    };

    checkQuestionnaireStatus();
  }, [user, router]);

  // Keep your handleSelect logic
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

  // Keep your handleSubmit logic, but add credit_plan as an array
  const handleSubmit = async () => {
    // Ensure all questions have at least one selection
    if (
      Object.keys(answers).length !== questions.length ||
      Object.values(answers).some((ans) => ans.length === 0)
    ) {
      setError(true);
      return;
    }

    setLoading(true);

    if (user) {
      // Example placeholder plan as an array of steps
      const placeholderPlan = [
        "Step 1: Improve payment history",
        "Step 2: Reduce credit utilization",
        "Step 3: Remove inaccuracies from your credit report",
      ];

      // Save responses & plan to Supabase (upsert or update)
      const { error: supabaseError } = await supabase
        .from("credit_plans")
        .upsert([
          {
            user_id: user.id,
            selected_disputes: answers, // or JSON.stringify(answers), if column is TEXT
            questionnaire_completed: true,
            plan_type: "free", // Adjust if needed
            // Store the plan in the array field "credit_plan"
            credit_plan: placeholderPlan,
          },
        ]);

      if (supabaseError) {
        console.error("Error saving responses:", supabaseError);
      } else {
        router.push("/dashboard");
      }
    }
  };

  // ─────────────────────────────────────────────────────────
  // UPDATED: Slight style & gradient background enhancement
  // ─────────────────────────────────────────────────────────
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
          Select up to <strong>3</strong> options per question to receive your
          best-fit credit plan.
        </p>

        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#006F7A", fontWeight: "bold" }}>
              {q.question}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
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
          <p
            style={{
              color: "red",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Please select at least one option per question.
          </p>
        )}

<button
  onClick={handleSubmit}
  disabled={loading || questionnaireCompleted} // 👈 Now it’s actually used
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
    cursor: loading || questionnaireCompleted ? "not-allowed" : "pointer",
    transition: "background-color 0.2s ease",
  }}
>
  {loading ? "Generating Plan..." : "Generate My Plan"}
</button>

      </div>
    </div>
  );
}
