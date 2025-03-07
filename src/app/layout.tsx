
import './globals.css';
import { ReactNode } from 'react';
import ClerkWrapper from '@/components/ClerkWrapper';

export const metadata = {
  title: 'AI CreditLab | DIY Credit Repair Powered by AI',
  description: 'Empowering you to repair your credit with AI-powered tools and personalized dispute letters.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkWrapper>{children}</ClerkWrapper>
      </body>
    </html>
  );
}
