"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const { user } = useUser(); // Removed isSignedIn since it wasn't used
  const [planType, setPlanType] = useState<"free" | "paid" | null>(null);
  const [creditPlan, setCreditPlan] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchUserPlan = async () => {
      const { data, error } = await supabase
        .from("credit_plans")
        .select("plan_type, credit_plan")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPlanType(data.plan_type);
        setCreditPlan(data.credit_plan || []);
      } else {
        setPlanType("free"); // Default to free if no plan found
      }
    };

    fetchUserPlan();
  }, [user]);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        backgroundColor: "#f8fafa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0097A7", textAlign: "center" }}>
        Welcome, {user?.firstName}!
      </h1>

      {/* Credit Plan Overview */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          marginTop: "24px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#006F7A" }}>Your AI Credit Plan</h2>
        {creditPlan.length > 0 ? (
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            {creditPlan.map((step, index) => (
              <li key={index} style={{ fontSize: "1.1rem", color: "#333", marginBottom: "8px" }}>
                {step}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "1.1rem", color: "#666" }}>No credit plan found. Please complete the questionnaire.</p>
        )}
        <Link
          href="/questionnaire"
          style={{
            display: "inline-block",
            marginTop: "12px",
            padding: "10px 16px",
            backgroundColor: "#0097A7",
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Update Your Plan
        </Link>
      </div>

      {/* Dispute Templates Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          marginTop: "24px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#006F7A" }}>Dispute Center</h2>
        <p style={{ fontSize: "1.1rem", color: "#333" }}>
          Generate AI-powered dispute templates and take control of your credit report.
        </p>
        <Link
          href="/dispute-center"
          style={{
            display: "inline-block",
            marginTop: "12px",
            padding: "10px 16px",
            backgroundColor: "#0097A7",
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Access Dispute Templates
        </Link>
      </div>

      {/* Paid Features Section */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          marginTop: "24px",
          opacity: planType === "paid" ? "1" : "0.5",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#006F7A" }}>Premium Tools</h2>
        <p style={{ fontSize: "1.1rem", color: "#333" }}>
          AI-driven insights, step-by-step repair strategies, and real-time credit tracking.
        </p>
        {planType === "paid" ? (
          <Link
            href="/premium-tools"
            style={{
              display: "inline-block",
              marginTop: "12px",
              padding: "10px 16px",
              backgroundColor: "#0097A7",
              color: "white",
              fontWeight: "bold",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Explore Premium Features
          </Link>
        ) : (
          <Link
            href="/upgrade"
            style={{
              display: "inline-block",
              marginTop: "12px",
              padding: "10px 16px",
              backgroundColor: "#006F7A",
              color: "white",
              fontWeight: "bold",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}
