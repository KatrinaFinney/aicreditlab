'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: '1rem',
      }}
    >
      {/* Centering container */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        <SignIn
          routing="hash"
          appearance={{
            elements: {
              // We remove "mx-auto" because the container already centers the component.
              rootBox: 'w-full',
            },
          }}
        />
      </div>
    </div>
  );
}
