import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from 'react';
import LayoutContent from '@/components/LayoutContent';
import FunnelAnalytics from '@/components/FunnelAnalytics';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aicreditlab.com'),
  title: 'AI CreditLab | Credit repair, simplified',
  description: 'Create your credit action plan, customize letters to dispute report errors, and track your progress. Free to start. No credit card required.',
  openGraph: { title: 'AI CreditLab | Credit repair, simplified', description: 'Disputes made easy. Create a free credit action plan and customize dispute letters.', url: 'https://www.aicreditlab.com', type: 'website' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/questionnaire">
    <html lang="en"><body><Suspense fallback={<p>Loading…</p>}><LayoutContent>{children}</LayoutContent></Suspense><FunnelAnalytics /></body></html>
  </ClerkProvider>;
}
