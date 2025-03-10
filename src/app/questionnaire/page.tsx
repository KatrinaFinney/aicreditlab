"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  {
    question: "What’s your main credit goal?",
    options: [
      "Remove inaccurate items",
      "Improve credit score",
      "Get approved for a loan",
      "Lower interest rates",
      "Stop creditor harassment",
    ],
  },
  {
    question: "What are your biggest credit challenges?",
    options: [
      "Late payments",
      "Collections or charge-offs",
      "High credit utilization",
      "No credit history",
      "Too many hard inquiries",
    ],
  },
  {
    question: "Which habits describe your credit behavior?",
    options: [
      "Pay at least the minimum on time",
      "Use over 30% of my credit limit",
      "Apply for new credit often",
      "Monitor my credit score",
      "Have unpaid accounts in collections",
    ],
  },
  {
    question: "How prepared are you to dispute items?",
    options: [
      "I have copies of my credit reports",
      "I’ve sent dispute letters before",
      "I need help understanding my credit reports",
    ],
  },
];

export default function Questionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    if (answers.includes(option)) {
      setAnswers(answers.filter((a) => a !== option)); // Toggle off selection
    } else if (answers.length < 3) {
      setAnswers([...answers, option]); // Allow up to 3 selections
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      console.log("User's selected answers:", answers);
      router.push("/dashboard"); // Redirect to dashboard
    }
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
        {`Step ${step + 1} of ${questions.length}`} – Answer a few quick questions to build your personalized Credit Plan.
      </p>

      <h3 style={{ color: "#006F7A", marginBottom: "10px" }}>{questions[step].question}</h3>

      {questions[step].options.map((option) => (
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

      <button
        onClick={handleNext}
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
        {step === questions.length - 1 ? "Get My Credit Plan" : "Next"}
      </button>
    </div>
  );
}
