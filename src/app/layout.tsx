"use client";

import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>AI CreditLab</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <LayoutContent>{children}</LayoutContent>
        </body>
      </html>
    </ClerkProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

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
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
