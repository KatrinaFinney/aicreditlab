'use client';

export default function LearnMorePage() {
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
        padding: '1rem',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Credit progress, without the pressure.</h1>
      <p style={{ fontSize: '1.25rem', textAlign: 'center', maxWidth: '600px' }}>
        AI CreditLab helps you make a plan for personal or business credit and stay on top of your next steps.
        If you spot a specific mistake on a personal credit report, our Letter Lab helps you prepare a draft to review and send yourself.
        No magic fixes. Just a clearer way forward.
      </p>
    </div>
  );
}
