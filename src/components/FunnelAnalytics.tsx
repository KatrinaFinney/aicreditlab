'use client';
import { Analytics } from '@vercel/analytics/react';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { trackFunnel } from '@/lib/funnel';
export default function FunnelAnalytics() {
  const { isSignedIn } = useUser();
  useEffect(() => {
    if (!isSignedIn) return;
    try {
      if (sessionStorage.getItem('creditlab-signup-pending') === '1') {
        sessionStorage.removeItem('creditlab-signup-pending');
        trackFunnel('account_ready');
      }
    } catch { /* Storage may be unavailable in private browsing. */ }
  }, [isSignedIn]);
  return <Analytics beforeSend={(event) => {
    // Never send auth query strings, personal answers or letter contents.
    const url = new URL(event.url); url.search = ''; url.hash = '';
    return { ...event, url: url.toString() };
  }} />;
}
