"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

const TEAL_H1 = "#0097A7";
const TEAL_BUTTON = "#0097A7";
const CARD_BG = "#D6D9E0";


export default function WaitlistPage() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-in", {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
      });

      gsap.from(".bullet", {
        opacity: 0,
        x: -20,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.8,
      });

      gsap.from(".footer-anim", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.out",
        delay: 1.5,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main
      style={{
        background: "linear-gradient(135deg, #d0f0f7 0%, #ecfbfc 100%)",
        minHeight: "100vh",
        fontFamily: '"Nunito", "Inter", sans-serif',
        padding: "64px 20px",
        color: "#1E1E1E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        className="fade-in"
        style={{
          fontSize: "clamp(2rem, 6vw, 3.25rem)",
          fontWeight: 700,
          color: TEAL_H1,
          textAlign: "center",
          marginBottom: "16px",
        }}
      >
        Fix Your Credit Smarter—Not Harder
      </h1>
      <p
        className="fade-in"
        style={{
          fontSize: "1.2rem",
          color: "#006F7A",
          textAlign: "center",
          maxWidth: "600px",
          marginBottom: "12px",
        }}
      >
        Download the free AI Credit Checklist: 5 credit moves that actually matter.
      </p>
      <p
        className="fade-in"
        style={{
          fontSize: "0.95rem",
          color: "#444",
          textAlign: "center",
          marginBottom: "32px",
        }}
      >
        Plus get early access to AI CreditLab before it launches.
      </p>

      {/* MailerLite Embed Placeholder */}
      <div
        className="fade-in"
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          marginBottom: "40px",
        }}
        dangerouslySetInnerHTML={{
          __html: `<div><!-- Paste your MailerLite embed HTML here --></div>`,
        }}
      />

      {/* Benefits */}
      <div
        className="fade-in"
        style={{
          backgroundColor: CARD_BG,
          padding: "24px",
          borderRadius: "12px",
          maxWidth: "600px",
          marginBottom: "40px",
        }}
      >
        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          <li className="bullet" style={{ marginBottom: "10px" }}>
            Clean up hidden errors dragging your score
          </li>
          <li className="bullet" style={{ marginBottom: "10px" }}>
            Learn what to dispute, settle, or leave alone
          </li>
          <li className="bullet">
            Build a 30-day credit repair routine that actually works
          </li>
        </ul>
      </div>

      {/* Footer */}
      <footer className="footer-anim" style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
        <p style={{ marginBottom: "12px" }}>
          We’ll never spam you. Unsubscribe anytime.
        </p>
        <Link href="/" style={{ color: TEAL_BUTTON, textDecoration: "underline" }}>
          Back to Home
        </Link>
      </footer>
    </main>
  );
}
