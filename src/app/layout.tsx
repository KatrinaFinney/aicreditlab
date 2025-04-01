"use client"; // This ensures the client-side rendering

import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Dynamically import ClerkProvider using Next.js dynamic import
const ClerkProvider = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.ClerkProvider),
  { ssr: false } // Ensure ClerkProvider is rendered only on the client
);

// Import Navbar (Ensure the path is correct)
import Navbar from "../components/Navbar";

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // Don't show Navbar for the waitlist page
  const isWaitlistPage = pathname === "/waitlist";

  useEffect(() => {
    if (!isSignedIn) return;

    const checkQuestionnaireStatus = async () => {
      const { data } = await supabase
        .from("credit_plans")
        .select("questionnaire_completed")
        .eq("user_id", user?.id)
        .single();

      if (!data?.questionnaire_completed) {
        router.push("/questionnaire");
      } else {
        router.push("/dashboard");
      }
    };

    checkQuestionnaireStatus();
  }, [isSignedIn, router, user]);

  return (
    <div>
      {/* Only render Navbar if not on the waitlist page */}
      {!isWaitlistPage && <Navbar />}
      <main>{children}</main>
    </div>
  );
}
