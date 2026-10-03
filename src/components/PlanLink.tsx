'use client';
import Link from 'next/link';
import { trackFunnel } from '@/lib/funnel';
export default function PlanLink({ children, className, source }: { children: React.ReactNode; className?: string; source: string }) {
  return <Link href="/questionnaire" className={className} onClick={() => trackFunnel('start_plan', { source })}>{children}</Link>;
}
