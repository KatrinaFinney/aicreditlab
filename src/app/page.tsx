"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { gsap } from "gsap";

// Color Variables
const BACKGROUND_GRADIENT = "linear-gradient(135deg, #d0f0f7 0%, #ecfbfc 100%)"; 
const TEXT_MAIN = "#1E1E1E";
const CARD_BG = "#D6D9E0";
const TEAL_H1 = "#0097A7";
const TEAL_BUTTON = "#0097A7";
const TEAL_HOVER = "#006F7A";
const SIGN_UP_BORDER = "#0097A7";
const SIGN_UP_HOVER_BG = "#DAF5F5";
const FOOTER_BG = "#004E5A";
const FOOTER_TEXT = "#E0F7F9";

export default function Home() {
  useEffect(() => {
    // Background Position Animation
    gsap.fromTo(
      ".hero-bg",
      { backgroundPosition: "0% 50%" },
      { backgroundPosition: "100% 50%", duration: 6, repeat: -1, ease: "linear" }
    );

    // Hero/Text/Buttons Animation
    gsap.fromTo(
      ".animate",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
    );

    // Cards Animation
    gsap.fromTo(
      ".card-animate",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );

    // Footer Animation
    gsap.fromTo(
      ".footer",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  return (
    <div
      className="hero-bg"
      style={{
        background: BACKGROUND_GRADIENT,
        minHeight: "100vh",
        color: TEXT_MAIN,
        fontFamily: '"Nunito", "Inter", sans-serif',
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
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
          paddingTop: "8vh", // Moves H1 higher on mobile
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

        {/* Mobile-Responsive Buttons */}
        <div
          className="animate"
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link
            href="/sign-in"
            style={{
              padding: "0.65rem 1.2rem",
              borderRadius: "0.5rem",
              backgroundColor: TEAL_BUTTON,
              color: "#FFF",
              fontWeight: 500,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "background-color 0.3s ease",
              width: "160px",
              textAlign: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL_BUTTON)}
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            style={{
              padding: "0.65rem 1.2rem",
              borderRadius: "0.5rem",
              border: `2px solid ${SIGN_UP_BORDER}`,
              color: SIGN_UP_BORDER,
              fontWeight: 500,
              fontSize: "1rem",
              textDecoration: "none",
              backgroundColor: "transparent",
              transition: "all 0.3s ease",
              width: "160px",
              textAlign: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SIGN_UP_HOVER_BG)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Get Started for Free
          </Link>
        </div>
      </div>

      {/* 6 Feature Cards */}
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
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#006F7A" }}>
                {feature.title}
              </h3>
              <p style={{ color: "#333" }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="animate"
        style={{
          backgroundColor: "#f0fcfc",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#007882" }}>
          Take Charge of Your Credit Today
        </h2>
        <p style={{ margin: "16px auto", maxWidth: "600px", color: "#333" }}>
          AI CreditLab gives you the tools to fix credit errors, boost your score, and take control of your financial future. Sign up today—it's free to start!
        </p>
        <Link
          href="/sign-up"
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
          Get Started Now
        </Link>
      </div>

      {/* Footer */}
      <footer
        className="footer"
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
