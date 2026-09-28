"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

// Define TypeScript interface for Dispute Templates
interface DisputeTemplate {
  id: string;
  title: string;
  category: string;
  download_pdf_url: string;
  download_docx_url?: string;
}

export default function DisputeCenter() {
  const { user } = useUser();
  const [planType, setPlanType] = useState<"free" | "paid" | null>(null);
  const [templates, setTemplates] = useState<DisputeTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchTemplates = async () => {
      const response = await fetch('/api/dispute-templates');
      if (response.ok) {
        const { templates, planType } = await response.json();
        setTemplates(templates);
        setPlanType(planType);
      }
    };

    fetchTemplates();
  }, [user]);

  // Filter templates based on search input
  const filteredTemplates = templates.filter((template) =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        backgroundColor: "#f8fafa",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          color: "#0097A7",
          textAlign: "center",
        }}
      >
        Dispute Center
      </h1>

      {/* Search Input */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search dispute templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px",
            width: "80%",
            maxWidth: "400px",
            borderRadius: "8px",
            border: "1px solid #0097A7",
            fontSize: "1rem",
            outline: "none",
          }}
        />
      </div>

      {/* Templates List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#006F7A",
                }}
              >
                {template.title}
              </h3>
              <p
                style={{
                  color: "#333",
                  fontSize: "1rem",
                  marginBottom: "10px",
                }}
              >
                {template.category}
              </p>

              {/* Free Users - Download PDFs */}
              <a
                href={template.download_pdf_url}
                download
                style={{
                  display: "inline-block",
                  padding: "10px",
                  backgroundColor: "#0097A7",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  textDecoration: "none",
                  marginTop: "10px",
                }}
              >
                Download PDF
              </a>

              {/* Paid Users - Download Editable DOCX & AI Customization */}
              {planType === "paid" && template.download_docx_url && (
                <>
                  <a
                    href={template.download_docx_url}
                    download
                    style={{
                      display: "block",
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#006F7A",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "8px",
                      textDecoration: "none",
                    }}
                  >
                    Download DOCX
                  </a>

                </>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#666", fontSize: "1.2rem" }}>
            No templates found.
          </p>
        )}
      </div>
    </div>
  );
}
