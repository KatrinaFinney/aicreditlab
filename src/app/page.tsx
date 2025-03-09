"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { gsap } from "gsap";

//
// Color Variables
//
const BACKGROUND_GRADIENT = "linear-gradient(135deg, #e0f7f9 0%, #f8fcfc 100%)"; // Main gradient
const TEXT_MAIN = "#1E1E1E";   // Primary text color
const CARD_BG = "#D6D9E0";     // Darker card background
const TEAL_H1 = "#0097A7";     // H1 color (bright teal)
const TEAL_BUTTON = "#0097A7"; // Teal for Sign In button
const TEAL_HOVER = "#006F7A";  // Hover color for buttons
const SIGN_UP_BORDER = "#0097A7"; // Teal border for Sign Up button
const SIGN_UP_HOVER_BG = "#DAF5F5"; // Light teal hover background
const FOOTER_BG = "#006F7A";   // Dark teal footer
const FOOTER_TEXT = "#E0F7F9"; // Light text for footer

export default function Home() {
  useEffect(() => {
    // GSAP animations
    gsap.fromTo(
      ".animate",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
    );

    // Animate cards with a stagger effect
    gsap.fromTo(
      ".card-animate",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
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
          Credit Repair, Reinvented.
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
          Struggling with credit report errors? AI CreditLab automates dispute letters, tracks your progress, and helps you improve your score—without the guesswork.
        </p>

        <div className="animate" style={{ display: "flex", gap: "1.5rem" }}>
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

          <Link
            href="/sign-up"
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: `2px solid ${SIGN_UP_BORDER}`,
              color: SIGN_UP_BORDER,
              fontWeight: 500,
              textDecoration: "none",
              backgroundColor: "transparent",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SIGN_UP_HOVER_BG)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Get Started for Free
          </Link>
        </div>
      </div>

      {/* Why AI CreditLab? (6 Animated Cards) */}
      <div
        className="animate"
        style={{
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#007882", marginBottom: "20px" }}>
          Why Choose AI CreditLab?
        </h2>
        <p style={{ maxWidth: "700px", margin: "0 auto", marginBottom: "32px", color: "#333" }}>
          Traditional credit repair is expensive, confusing, and slow. AI CreditLab eliminates hidden fees, automates dispute letters, and puts you in control.
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
          {[
            { title: "AI-Powered Dispute Letters", description: "Our AI drafts dispute letters tailored to your case—no templates, just precision." },
            { title: "Real-Time Tracking", description: "Track dispute progress in one place with live updates and alerts." },
            { title: "Fast & Automated", description: "No waiting—AI CreditLab moves as fast as the credit bureaus allow." },
            { title: "No Expertise Needed", description: "AI guides you every step—no legal knowledge or credit expertise required." },
            { title: "Score Improvement Insights", description: "Get AI-driven suggestions on improving your credit beyond disputes." },
            { title: "Secure & Private", description: "Data encryption ensures your personal information stays safe and confidential." },
          ].map((feature, index) => (
            <div
              key={index}
              className="card-animate"
              style={{
                backgroundColor: CARD_BG,
                padding: "20px",
                borderRadius: "12px",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>{feature.title}</h3>
              <p style={{ color: "#333" }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: FOOTER_BG,
          padding: "20px",
          textAlign: "center",
          color: FOOTER_TEXT,
          marginTop: "40px",
        }}
      >
        <p>© {new Date().getFullYear()} AI CreditLab. All rights reserved.</p>
        <Link href="/privacy-policy" style={{ color: FOOTER_TEXT, textDecoration: "underline" }}>
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
