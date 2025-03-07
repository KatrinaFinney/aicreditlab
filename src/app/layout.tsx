'use client';

import './globals.css';
import { ReactNode } from 'react';
import ClerkWrapper from '@/components/ClerkWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkWrapper>
          {children}
        </ClerkWrapper>
      </body>
    </html>
  );
}
