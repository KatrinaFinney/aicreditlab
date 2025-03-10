"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [planType, setPlanType] = useState<"free" | "paid" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user's plan type from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchPlanType = async () => {
      const { data, error } = await supabase
        .from("credit_plans")
        .select("plan_type")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPlanType(data.plan_type);
      } else {
        setPlanType("free"); // Default to free if no plan found
      }
    };

    fetchPlanType();
  }, [user]);

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 32px",
      background: "#0097A7",
      color: "white",
      fontFamily: "'Nunito', 'Inter', sans-serif",
    }}>
      {/* Logo & Site Name */}
      <Link href="/" style={{
        textDecoration: "none",
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "white"
      }}>
        AI CreditLab
      </Link>

      {/* Desktop Navigation */}
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
        {isSignedIn && <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>}
        {isSignedIn && planType === "paid" && (
          <Link href="/premium-tools" style={{ color: "white", textDecoration: "none" }}>Premium Tools</Link>
        )}
      </div>

      {/* Account Menu */}
      <div style={{ position: "relative" }}>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
        >
          {isSignedIn ? "Account ▼" : "Sign In"}
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute",
            right: 0,
            top: "100%",
            background: "white",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "6px",
            overflow: "hidden",
            width: "180px",
            display: "flex",
            flexDirection: "column"
          }}>
            {isSignedIn ? (
              <>
                <Link href="/dashboard" style={{ padding: "10px", color: "#0097A7", textDecoration: "none" }}>
                  Dashboard
                </Link>
                <Link href="/account" style={{ padding: "10px", color: "#0097A7", textDecoration: "none" }}>
                  Account Settings
                </Link>
                {planType === "paid" && (
                  <Link href="/billing" style={{ padding: "10px", color: "#0097A7", textDecoration: "none" }}>
                    Manage Billing
                  </Link>
                )}
                <SignOutButton>
                  <button style={{
                    padding: "10px",
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: "red",
                    textAlign: "left",
                    cursor: "pointer"
                  }}>
                    Sign Out
                  </button>
                </SignOutButton>
              </>
            ) : (
              <Link href="/sign-in" style={{ padding: "10px", color: "#0097A7", textDecoration: "none" }}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
