"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ FIXED: Use next/navigation in App Router

const questions = [
  {
    question: "What’s your main credit goal?",
    options: ["Remove errors", "Increase score", "Get approved for a loan"],
  },
  {
    question: "Which of these applies to you?",
    options: ["Late payments", "Collections", "High credit utilization"],
  },
];

export default function Questionnaire() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    if (answers.includes(option)) {
      setAnswers(answers.filter((a) => a !== option)); // Toggle off selection
    } else if (answers.length < 3) {
      setAnswers([...answers, option]); // Allow up to 3 selections
    }
  };

  const handleSubmit = () => {
    console.log("User's selected answers:", answers);
    router.push("/dashboard"); // Redirect to dashboard after completion
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#0097A7", marginBottom: "20px" }}>Credit Assessment</h1>
      <p style={{ marginBottom: "24px", color: "#333" }}>
        Answer a few quick questions so we can build your personalized Credit Blueprint.
      </p>

      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: "20px", textAlign: "left" }}>
          <h3 style={{ color: "#006F7A", marginBottom: "10px" }}>{q.question}</h3>
          {q.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                margin: "5px 0",
                backgroundColor: answers.includes(option) ? "#0097A7" : "#f0f0f0",
                color: answers.includes(option) ? "white" : "#333",
                border: "1px solid #0097A7",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: "#0097A7",
          color: "white",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#006F7A")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0097A7")}
      >
        Get My Credit Plan
      </button>
    </div>
  );
}
