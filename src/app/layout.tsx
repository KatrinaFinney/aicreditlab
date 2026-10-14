import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from 'react';
import LayoutContent from '@/components/LayoutContent';
import FunnelAnalytics from '@/components/FunnelAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aicreditlab.com'),
  title: 'AI CreditLab | DIY Credit Repair & Dispute Tools',
  description: 'DIY credit repair with a clearer dispute strategy. Prepare personal dispute letters, track your next steps, and get AI-assisted drafts with Plus. Start free.',
  openGraph: { title: 'AI CreditLab | DIY Credit Repair & Dispute Tools', description: 'Less guesswork. More game plan. Start free with personal dispute templates; Plus adds AI-assisted letter drafts.', url: 'https://www.aicreditlab.com', type: 'website' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/questionnaire">
    <html lang="en"><body><Suspense fallback={<p>Loading…</p>}><LayoutContent>{children}</LayoutContent></Suspense><FunnelAnalytics /></body></html>
  </ClerkProvider>;
}
