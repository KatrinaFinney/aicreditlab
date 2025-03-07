'use client';
import { useState } from 'react';

export default function GenerateLetterForm() {
  const [userInput, setUserInput] = useState('');
  const [letter, setLetter] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/generate-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput }),
    });
    const data = await res.json();
    setLetter(data.letter);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', color: '#FAFAFA', backgroundColor: '#121212', padding: '2rem', borderRadius: '0.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Generate Dispute Letter</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter account number or details"
          style={{ padding: '0.75rem', width: '100%', marginBottom: '1rem', borderRadius: '0.5rem' }}
        />
        <button
          type="submit"
          style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#00D9C0', color: 'white', fontWeight: '500', border: 'none', cursor: 'pointer' }}
        >
          Generate Dispute Letter
        </button>
      </form>
      {letter && (
        <div style={{ marginTop: '2rem', backgroundColor: '#1f1f1f', padding: '1rem', borderRadius: '0.5rem' }}>
          <pre style={{ color: '#FAFAFA' }}>{letter}</pre>
        </div>
      )}
    </div>
  );
}
