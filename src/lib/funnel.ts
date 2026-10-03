import { track } from '@vercel/analytics';
export function trackFunnel(name: 'start_plan' | 'plan_preview' | 'signup_started' | 'account_ready' | 'plan_saved' | 'letter_download' | 'letter_preview', properties?: { source?: string }) {
  try { track(name, properties); } catch { /* Analytics must never block the product. */ }
}
