'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const ClerkProviderNoSSR = dynamic(
  () =>
    import('@clerk/nextjs').then(
      (mod) => mod.ClerkProvider as React.ComponentType<any>
    ),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export default function ClerkWrapper({ children }: { children: ReactNode }) {
  return <ClerkProviderNoSSR>{children}</ClerkProviderNoSSR>;
}
