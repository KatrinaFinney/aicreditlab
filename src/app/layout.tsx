"use client"; // This ensures the client-side rendering

import "./globals.css";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Dynamically import ClerkProvider using Next.js dynamic import
const ClerkProvider = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.ClerkProvider),
  { ssr: false } // Ensure ClerkProvider is rendered only on the client
);

// Import Navbar (Ensure the path is correct)
import Navbar from "../components/Navbar";

// Supabase client setup

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The root layout includes the <html> and <body> tags here
    <html lang="en">
      <head>
        <title>AI CreditLab</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <ClerkProvider>
            <LayoutContent>{children}</LayoutContent>
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();  // Correct hook for current path

  // Don't show Navbar for the waitlist page
  const isWaitlistPage = pathname === "/waitlist";

  return (
    <div>
      {/* Only render Navbar if not on the waitlist page */}
      {!isWaitlistPage && <Navbar />}
      <main>{children}</main>
    </div>
  );
}
