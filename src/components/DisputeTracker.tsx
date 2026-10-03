'use client';
import { useEffect, useState, type FormEvent } from 'react';

type Case = { id: string; creditor: string; agency: string; status: string };
export default function DisputeTracker() {
  const [cases, setCases] = useState<Case[]>([]);
  const [creditor, setCreditor] = useState('');
  const [agency, setAgency] = useState('Equifax');
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/disputes').then(async (response) => {
      if (response.ok) setCases((await response.json()).disputes);
    });
  }, []);
  const add = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    try {
      const response = await fetch('/api/disputes', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creditor, agency }) });
      if (!response.ok) throw new Error('Could not save the dispute');
      const { dispute } = await response.json();
      setCases((current) => [dispute, ...current]); setCreditor('');
    } catch { setError('Could not save the dispute. Please try again.'); }
  };
  const change = async (item: Case, status: string) => {
    setError('');
    try {
      const response = await fetch('/api/disputes', { method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, status }) });
      if (!response.ok) throw new Error('Could not update the dispute');
      const { dispute } = await response.json();
      setCases((current) => current.map((entry) => entry.id === item.id ? dispute : entry));
    } catch { setError('Could not update the dispute. Please try again.'); }
  };
  return <section style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: 'var(--surface)', borderRadius: 12 }}>
    <h2 style={{ color: 'var(--accent)' }}>Keep tabs on your disputes</h2>
    <p style={{ color: 'var(--text)' }}>A simple place to note where each dispute stands. Mark a case Sent only after you actually send it—we don’t contact credit bureaus for you.</p>
    <form onSubmit={add} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '20px 0' }}>
      <input required maxLength={150} value={creditor} onChange={(event) => setCreditor(event.target.value)}
        aria-label="Company or account name" placeholder="Company or account name" style={{ padding: 10, flex: '1 1 200px' }} />
      <select aria-label="Credit bureau" value={agency} onChange={(event) => setAgency(event.target.value)} style={{ padding: 10 }}>
        <option>Equifax</option><option>Experian</option><option>TransUnion</option>
      </select>
      <button style={{ padding: '10px 16px', background: 'var(--accent-strong)', color: '#071d25', border: 0, borderRadius: 8 }}>Add to my tracker</button>
    </form>
    {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
    {cases.length === 0 ? <p>No cases saved yet.</p> : <ul style={{ padding: 0, listStyle: 'none' }}>
      {cases.map((item) => <li key={item.id} style={{ borderTop: '1px solid var(--line)', padding: '16px 0', display: 'flex', gap: 20, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span>{item.creditor} · {item.agency}</span>
        <label>Status: <select value={item.status} onChange={(event) => change(item, event.target.value)} style={{ padding: 6 }}>
          {['Draft', 'Sent', 'Resolved'].map((status) => <option key={status}>{status}</option>)}
        </select></label>
      </li>)}
    </ul>}
  </section>;
}
