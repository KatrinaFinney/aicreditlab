import Link from 'next/link';
import Image from 'next/image';

const teal = '#007f8d';
const dark = '#16383e';
const card = { background: '#fff', border: '1px solid #d6e9e9', borderRadius: 18, padding: 28, boxShadow: '0 12px 32px rgba(9, 73, 78, .06)' };
const button = { display: 'inline-block', background: teal, color: '#fff', padding: '14px 22px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' };

export default function Home() {
  return <div style={{ color: dark, background: '#f7fcfb', fontFamily: 'Arial, sans-serif' }}>
    <section style={{ background: 'radial-gradient(circle at 80% 10%, #b9ebdf, transparent 38%), linear-gradient(140deg, #e4f8f5, #f9fdfd)', padding: '70px 24px 82px' }}>
      <div style={{ maxWidth: 1100, margin: 'auto', display: 'flex', gap: 54, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 420px' }}>
          <p style={{ letterSpacing: 2, textTransform: 'uppercase', color: teal, fontWeight: 800, fontSize: 13 }}>A clearer way to work on your credit</p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.08, margin: '18px 0' }}>Know your next credit move.</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, maxWidth: 590, color: '#36575c' }}>
            Answer a few questions, get a practical action plan, and keep track of what you finish. If you find an error on your credit report, prepare a letter you can review and send yourself.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 30 }}>
            <Link href="/questionnaire" style={button}>Build my free plan</Link>
            <Link href="#how-it-works" style={{ ...button, background: 'transparent', border: `2px solid ${teal}`, color: teal }}>How it works</Link>
          </div>
          <p style={{ fontSize: 14, color: '#53757a', marginTop: 18 }}>Free to start · No credit report upload required</p>
        </div>
        <div style={{ ...card, flex: '0 1 300px', textAlign: 'center', background: 'rgba(255,255,255,.88)' }}>
          <Image src="/ai-creditlab-logo.png" width={130} height={130} alt="AI CreditLab" style={{ objectFit: 'contain' }} priority />
          <h2 style={{ fontSize: 22, margin: '16px 0 10px' }}>Your plan, one step at a time</h2>
          <p style={{ lineHeight: 1.6, color: '#42666a' }}>Understand your priorities. Mark actions complete. Come back when you are ready for the next one.</p>
        </div>
      </div>
    </section>
    <section id="how-it-works" style={{ maxWidth: 1100, margin: 'auto', padding: '74px 24px' }}>
      <p style={{ color: teal, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontSize: 13 }}>The process</p>
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '12px 0 32px' }}>Three useful steps, without the overwhelm.</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
        {[
          ['01', 'Tell us what is going on', 'Choose the credit challenges, goals, and habits that fit your situation.'],
          ['02', 'Get an action plan', 'See concrete steps based on your answers, with a clear next action.'],
          ['03', 'Work through it', 'Mark steps complete and return to your dashboard when you are ready.'],
        ].map(([number, title, description]) => <article key={number} style={card}>
          <span style={{ color: teal, fontWeight: 800, fontSize: 28 }}>{number}</span>
          <h3 style={{ fontSize: 21, marginBottom: 10 }}>{title}</h3><p style={{ lineHeight: 1.6, color: '#47656a' }}>{description}</p>
        </article>)}
      </div>
    </section>
    <section style={{ background: '#eaf7f5', padding: '72px 24px' }}>
      <div style={{ maxWidth: 1100, margin: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 32, alignItems: 'center' }}>
        <div><p style={{ color: teal, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontSize: 13 }}>When you spot an error</p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Prepare a dispute with the facts in front of you.</h2>
          <p style={{ lineHeight: 1.7, color: '#47656a' }}>Choose from a free library of customizable letters. Describe the specific information you believe is inaccurate and the correction you are requesting. Review and download a draft, then add your supporting documents before sending it.</p>
          <Link href="/dispute-generator" style={button}>Draft a letter</Link>
        </div>
        <div style={card}><h3 style={{ marginTop: 0 }}>What this tool does</h3>
          <ul style={{ lineHeight: 2, paddingLeft: 22 }}><li>Organizes the error you describe</li><li>Creates an editable text draft</li><li>Reminds you to include supporting records</li></ul>
          <p style={{ fontSize: 14, color: '#47656a' }}>You review and send the letter. We do not submit disputes for you or promise a particular result.</p>
        </div>
      </div>
    </section>
    <section style={{ maxWidth: 1100, margin: 'auto', padding: '74px 24px' }}>
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Start with the free plan.</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20 }}>
        <div style={{ ...card, border: `2px solid ${teal}` }}><h3>Smart Credit Starter</h3><p>Available in the current product</p>
          <ul style={{ lineHeight: 2, paddingLeft: 22 }}><li>Short credit assessment</li><li>Action plan based on your answers</li><li>Progress, focus mode, and short work sessions</li><li>Free customizable letter library</li><li>Manual dispute status tracking</li></ul>
          <Link href="/questionnaire" style={button}>Get started free</Link>
        </div>
        <div style={card}><h3>Guided roadmap</h3><p style={{ color: teal, fontWeight: 700 }}>In development</p>
          <p style={{ lineHeight: 1.7 }}>We are working toward deeper guidance, reminders, and more support for managing disputes. There is no paid checkout yet.</p>
        </div>
      </div>
    </section>
    <footer style={{ background: '#123e45', color: '#e8f6f5', padding: '32px 24px', textAlign: 'center', lineHeight: 1.7 }}>
      <p>AI CreditLab offers educational tools. Review your own information and seek qualified help when you need it.</p>
      <p>© {new Date().getFullYear()} AI CreditLab</p>
    </footer>
  </div>;
}
