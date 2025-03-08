'use client';

import { useEffect } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";
import { gsap } from "gsap";

const fetchDisputes = async () => {
  const { data, error } = await supabase
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return data;
};

export default function Dashboard() {
  const { data: disputes, error } = useSWR("disputes", fetchDisputes);

  useEffect(() => {
    gsap.fromTo(
      ".dashboard-container",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  if (error) return <p style={{ color: "red" }}>Error loading disputes.</p>;
  if (!disputes) return <p style={{ color: "#00D9C0" }}>Loading...</p>;

  return (
    <div
      className="dashboard-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "#FAFAFA",
        fontFamily: '"Nunito", "Inter", sans-serif',
        padding: "32px",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#00AEEF",
          textShadow: "0px 0px 10px rgba(0, 174, 239, 0.8)",
          background: "linear-gradient(135deg, rgba(0, 174, 239, 0.2), rgba(0, 217, 192, 0.4))",
          backdropFilter: "blur(10px)",
          padding: "10px 20px",
          borderRadius: "10px",
          display: "inline-block",
          boxShadow: "0px 4px 15px rgba(0, 217, 192, 0.3)",
        }}
      >
        Your Disputes
      </h1>
      <p style={{ fontSize: "16px", color: "#B0B3B8", marginBottom: "20px" }}>
        Track the progress of your disputes in real time.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {disputes.length > 0 ? (
          disputes.map((dispute) => (
            <div
              key={dispute.id}
              style={{
                backgroundColor: "#1E1E1E",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0, 151, 167, 0.3)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#00D9C0" }}>
                {dispute.creditor}
              </h3>
              <p style={{ fontSize: "14px", color: "#B0B3B8" }}>
                Agency: {dispute.agency}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: dispute.status === "Pending" ? "#FFD700" : "#00FF7F",
                  fontWeight: "bold",
                }}
              >
                Status: {dispute.status}
              </p>
            </div>
          ))
        ) : (
          <p>No disputes found.</p>
        )}
      </div>
    </div>
  );
}
