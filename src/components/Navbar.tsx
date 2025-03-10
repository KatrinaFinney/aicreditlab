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
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 48px",
        background: "#0097A7",
        color: "white",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* AI CreditLab Logo → Links to Dashboard if signed in, otherwise to Homepage */}
      <Link
        href={isSignedIn ? "/dashboard" : "/"}
        style={{
          textDecoration: "none",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "white",
        }}
      >
        AI CreditLab
      </Link>

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
            fontWeight: "600",
            padding: "6px 12px",
            transition: "all 0.2s ease",
          }}
        >
          {isSignedIn ? "Account ▼" : "Sign In"}
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              background: "white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
              borderRadius: "8px",
              overflow: "hidden",
              width: "180px",
              display: "flex",
              flexDirection: "column",
              padding: "8px 0",
            }}
          >
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    padding: "10px 16px",
                    color: "#0097A7",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/account"
                  style={{
                    padding: "10px 16px",
                    color: "#0097A7",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  Account Settings
                </Link>
                {planType === "paid" && (
                  <Link
                    href="/billing"
                    style={{
                      padding: "10px 16px",
                      color: "#0097A7",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                    }}
                  >
                    Manage Billing
                  </Link>
                )}
                <SignOutButton>
                  <button
                    style={{
                      padding: "10px 16px",
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      color: "red",
                      textAlign: "left",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Sign Out
                  </button>
                </SignOutButton>
              </>
            ) : (
              <Link
                href="/sign-in"
                style={{
                  padding: "10px 16px",
                  color: "#0097A7",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
