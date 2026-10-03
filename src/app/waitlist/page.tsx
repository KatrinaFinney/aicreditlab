"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

const TEAL = "#0097A7";
const TEAL_DARK = "#006F7A";
const BG = "#ecfbfc";
const TEXT = "#1e1e1e";
const FONT_STACK = "'Nunito', 'Inter', sans-serif";

export default function WaitlistPage() {
  useEffect(() => {
    gsap.fromTo(
      ".fade-in",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.2 }
    );
  }, []);

  return (
    <div
      style={{
        backgroundColor: BG,
        color: TEXT,
        fontFamily: FONT_STACK,
        minHeight: "85vh", // Adjusted the height to push content up
        padding: "64px 24px",
        display: "flex",
        justifyContent: "flex-start", // Aligns items to the top
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <h1
        className="fade-in"
        style={{
          fontSize: "clamp(2rem, 6vw, 3rem)",
          color: TEAL,
          marginBottom: "16px",
        }}
      >
        Your next credit move starts here.
      </h1>

      <p
        className="fade-in"
        style={{
          fontSize: "clamp(1rem, 3vw, 1.25rem)",
          color: TEAL_DARK,
          marginBottom: "8px",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <strong>
          Less guesswork. More of a plan you can actually use.
        </strong>
      </p>

      <span
        className="fade-in"
        style={{
          fontSize: "0.95rem",
          color: "#444",
          marginBottom: "32px",
          maxWidth: "500px",
        }}
      >
        Get the free <strong>AI Credit Checklist</strong>: five practical moves to help you get organized and decide what to tackle next. We’ll also share occasional AI CreditLab updates.
      </span>

      <form
        className="fade-in"
        action="https://assets.mailerlite.com/jsonp/1394794/forms/150432145792304398/subscribe"
        method="post"
        target="_blank"
        style={{
          maxWidth: "420px",
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
          padding: "24px",
        }}
      >
        <input
          type="email"
          name="fields[email]"
          placeholder="Your best email"
          required
          style={{
            width: "100%",
            padding: "14px 18px",
            marginBottom: "16px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontFamily: FONT_STACK,
            boxSizing: "border-box",
          }}
        />
        <input type="hidden" name="ml-submit" value="1" />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px 18px",
            fontSize: "1rem",
            backgroundColor: TEAL,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: FONT_STACK,
            fontWeight: "bold",
            transition: "background-color 0.3s ease",
            marginTop: "8px",
          }}
        >
          Send me the checklist
        </button>
        <input type="hidden" name="anticsrf" value="true" />
      </form>

      <footer
        className="fade-in"
        style={{
          marginTop: "48px",
          fontSize: "0.85rem",
          color: "#666",
        }}
      >
        Useful updates only. Unsubscribe anytime.
      </footer>
    </div>
  );
}
