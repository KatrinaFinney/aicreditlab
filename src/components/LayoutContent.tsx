'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
export default function LayoutContent({ children }: { children: React.ReactNode }) {
  return <>{usePathname() !== '/waitlist' && <Navbar />}<main>{children}</main></>;
}
