'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';

// 1. Import Montserrat from next/font/google
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function Home() {
  // 2. GSAP Animation for elements with .animate class
  useEffect(() => {
    gsap.fromTo(
      '.animate',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#121212',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#FAFAFA',
        padding: '1rem', // Adds breathing room on smaller screens
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Logo Section */}
        <img
          className="animate"
          src="/ai-creditlab-logo.png" // Ensure this file exists in your /public folder
          alt="AI CreditLab logo"
          style={{
            maxWidth: '200px',
            width: '50%',
            height: 'auto',
            margin: '0 auto',
          }}
        />

        {/* Headline */}
        <h1
          className="animate"
          style={{
            ...montserrat.style, // 3. Apply Montserrat
            fontSize: '3.75rem', // ~60px on larger screens
            fontWeight: 700,
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          AI CreditLab
        </h1>

        {/* Subtitle */}
        <p
          className="animate"
          style={{
            ...montserrat.style,
            fontSize: '2rem', // ~32px
            color: '#CCCCCC',
            margin: 0,
            fontWeight: 400,
          }}
        >
          DIY Credit Repair, Powered by AI.
        </p>

        {/* Buttons Container */}
        <div
          className="animate"
          style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            marginTop: '1.5rem',
            flexWrap: 'wrap', // Buttons wrap on smaller screens
          }}
        >
          {/* Sign In Button */}
          <Link
            href="/sign-in"
            style={{
              ...montserrat.style,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: '#00D9C0',
              color: '#FFFFFF',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background-color 0.3s ease',
              fontSize: '1rem',
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            Sign In
          </Link>

          {/* Learn More Button */}
          <Link
            href="/learn-more"
            style={{
              ...montserrat.style,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #00AEEF',
              color: '#FFFFFF',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontSize: '1rem',
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
