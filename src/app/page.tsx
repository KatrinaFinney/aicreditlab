"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { gsap } from "gsap";

//
// Color Variables
//
const BACKGROUND_GRADIENT = "linear-gradient(135deg, #e0f7f9 0%, #f8fcfc 100%)"; // Main gradient
const TEXT_MAIN = "#1E1E1E";         // Primary text color
const CARD_BG = "#D6D9E0";          // Darker card background
const TEAL_H1 = "#0097A7";          // New H1 color (bright teal)
const PURPLE_BORDER = "#6D00CC";     // Purple for sign-up button border & text
const TEAL_BUTTON = "#0097A7";       // Teal for 'Sign In' button
const TEAL_HOVER = "#006F7A";        // Hover color for 'Sign In' button

export default function Home() {
  useEffect(() => {
    gsap.fromTo(
      ".animate",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
    );
  }, []);

  return (
    <div
      style={{
        background: BACKGROUND_GRADIENT,
        minHeight: "100vh",
        color: TEXT_MAIN,
        fontFamily: '"Nunito", "Inter", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero / Top Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "64px 32px",
        }}
      >
        <Image
          className="animate"
          src="/ai-creditlab-logo.png"
          alt="AI CreditLab logo"
          width={180}
          height={180}
          style={{ marginBottom: "20px" }}
        />

        {/* Updated H1 color -> Teal */}
        <h1
          className="animate"
          style={{
            fontSize: "3.75rem",
            fontWeight: 700,
            color: TEAL_H1, 
            textShadow: `0px 0px 8px rgba(0, 151, 167, 0.4)`,
            marginBottom: "16px",
          }}
        >
          AI CreditLab
        </h1>

        <p
          className="animate"
          style={{
            fontSize: "1.25rem",
            color: "#006F7A",
            marginBottom: "24px",
            maxWidth: "600px",
          }}
        >
          DIY Credit Repair, Powered by AI. Build your financial future with automated dispute letters and real-time credit insights.
        </p>

        <div className="animate" style={{ display: "flex", gap: "1.5rem" }}>
          {/* Sign In Button */}
          <Link
            href="/sign-in"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: TEAL_BUTTON,
              color: "#FFF",
              fontWeight: 500,
              textDecoration: "none",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL_BUTTON)}
          >
            Sign In
          </Link>

          {/* Updated Sign Up Button -> Purple border/text */}
          <Link
            href="/sign-up"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: `2px solid ${PURPLE_BORDER}`,
              color: PURPLE_BORDER,
              fontWeight: 500,
              textDecoration: "none",
              backgroundColor: "transparent",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3e6ff")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Section 1: How It Works */}
      <div
        className="animate"
        style={{
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <h2 
          style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            color: "#007882", 
            marginBottom: "20px" 
          }}
        >
          How It Works
        </h2>
        <p style={{ maxWidth: "700px", margin: "0 auto", marginBottom: "32px", color: "#333" }}>
          AI CreditLab automates your credit dispute process using advanced AI. Our
          platform identifies errors, crafts powerful dispute letters, and monitors
          your progress every step of the way.
        </p>
        <div
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: CARD_BG,
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
              1. Connect
            </h3>
            <p style={{ color: "#333" }}>
              Link your credit data to AI CreditLab for real-time analysis.
            </p>
          </div>
          {/* Step 2 */}
          <div
            style={{
              backgroundColor: CARD_BG,
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
              2. Dispute
            </h3>
            <p style={{ color: "#333" }}>
              Our AI identifies errors & generates dispute letters automatically.
            </p>
          </div>
          {/* Step 3 */}
          <div
            style={{
              backgroundColor: CARD_BG,
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
              3. Monitor
            </h3>
            <p style={{ color: "#333" }}>
              Track credit changes and get real-time alerts as disputes progress.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Key Features */}
      <div
        className="animate"
        style={{
          backgroundColor: "#ffffff",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <h2 
          style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            color: "#007882", 
            marginBottom: "20px" 
          }}
        >
          Key Features
        </h2>
        <p style={{ maxWidth: "700px", margin: "0 auto", marginBottom: "32px", color: "#333" }}>
          Explore our AI-driven solutions designed to simplify credit repair and empower you to achieve financial freedom.
        </p>
        <div
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              backgroundColor: "#f8fafa",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0, 120, 130, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
              Automated Letters
            </h3>
            <p style={{ color: "#333" }}>
              Generate dispute letters tailored to your situation with just a click.
            </p>
          </div>
          {/* Feature 2 */}
          <div
            style={{
              backgroundColor: "#f8fafa",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0, 120, 130, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
              Real-Time Alerts
            </h3>
            <p style={{ color: "#333" }}>
              Stay updated on credit changes & disputes with instant notifications.
            </p>
          </div>
          {/* Feature 3 */}
          <div
            style={{
              backgroundColor: "#f8fafa",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0, 120, 130, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
              Easy Dashboard
            </h3>
            <p style={{ color: "#333" }}>
              All dispute statuses in one place for a clear overview of your progress.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: CTA / Final Call-to-Action */}
      <div
        className="animate"
        style={{
          backgroundColor: "#f0fcfc",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2 
          style={{ 
            fontSize: "2rem", 
            fontWeight: 700, 
            color: "#007882" 
          }}
        >
          Ready to Transform Your Credit?
        </h2>
        <p style={{ margin: "16px auto", maxWidth: "600px", color: "#333" }}>
          Join AI CreditLab today and take control of your financial future. No more confusing paperwork or hidden fees—just smart, AI-driven credit repair at your fingertips.
        </p>
        <Link
          href="/sign-in"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            backgroundColor: TEAL_BUTTON,
            color: "white",
            fontWeight: 500,
            textDecoration: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL_BUTTON)}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
