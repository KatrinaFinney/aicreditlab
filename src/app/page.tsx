import Link from 'next/link';

const steps = [
  ['01', 'Tell us what is going on', 'Start with personal or business credit, then choose the answers that fit your situation.'],
  ['02', 'Get an action plan', 'See concrete steps based on your answers, with a clear next action.'],
  ['03', 'Work through it', 'Mark steps complete and return when you are ready for the next one.'],
];

export default function Home() {
  return <div className="home">
    <section className="home-hero">
      <div className="home-container home-hero-grid">
        <div>
          <p className="eyebrow">A clearer way to work on your credit</p>
          <h1>Know your next <span>credit move.</span></h1>
          <p className="hero-copy">Choose a personal or business credit path, answer a few questions, and get an action plan you can track. If you find an error on a personal credit report, prepare a letter you can review and send yourself.</p>
          <div className="home-actions">
            <Link className="action-button" href="/questionnaire">Build my free plan <span aria-hidden="true">↗</span></Link>
            <Link className="action-button action-button-outline" href="#how-it-works">See how it works</Link>
          </div>
          <p className="hero-note">Free to start <span aria-hidden="true">·</span> No credit report upload required</p>
        </div>
        <aside className="hero-panel" aria-label="Your next steps">
          <div className="panel-top"><span className="panel-orbit" aria-hidden="true">✦</span><span>YOUR CREDIT WORKSPACE</span><span className="panel-dot" aria-hidden="true" /></div>
          <p className="panel-label">A little progress counts.</p>
          <h2>One clear step<br />at a time.</h2>
          <div className="mini-step"><span>01</span><p>Find your next action</p><span aria-hidden="true">↗</span></div>
          <div className="mini-step"><span>02</span><p>Make time for it</p><span aria-hidden="true">↗</span></div>
          <div className="mini-step"><span>03</span><p>Track what you finish</p><span aria-hidden="true">↗</span></div>
          <div className="panel-bottom">Built for real life, including busy days.</div>
        </aside>
      </div>
    </section>
    <section id="how-it-works" className="home-section home-container">
      <p className="eyebrow">The process</p>
      <h2 className="section-title">Three useful steps, <span>without the overwhelm.</span></h2>
      <div className="steps-grid">{steps.map(([number, title, description]) => <article className="feature-card" key={number}>
        <span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p>
      </article>)}</div>
    </section>
    <section className="home-band"><div className="home-container split-grid">
      <div><p className="eyebrow">When you spot an error</p>
        <h2 className="section-title">Get the facts down. <span>Make a clear request.</span></h2>
        <p>For personal credit reports, choose from 30 issue-specific letter topics. Describe the information you believe is inaccurate and the correction you are requesting. Review and download a draft, then add supporting documents before sending it.</p>
        <Link className="action-button" href="/dispute-center">Explore the letter library <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="feature-card checklist-card"><p className="eyebrow">Your draft, your decision</p><h3>What this tool does</h3>
        <ul><li>Organizes the error you describe</li><li>Creates an editable text draft</li><li>Reminds you to include supporting records</li></ul>
        <p>You review and send the letter. We do not submit disputes for you or promise a particular result.</p>
      </div>
    </div></section>
    <section className="home-section home-container"><p className="eyebrow">Choose your pace</p>
      <h2 className="section-title">Start with the <span>free plan.</span></h2>
      <div className="plans-grid"><div className="feature-card plan-card plan-featured"><span className="plan-tag">AVAILABLE NOW</span><h3>Smart Credit Starter</h3><p>A practical place to start and a way to keep going.</p>
        <ul><li>Separate personal and business credit action plans</li><li>Saved progress, focus mode, and short work sessions</li><li>Personal credit: 30 customizable letter topics; three downloads per month</li><li>Manual dispute status tracking</li></ul>
        <Link className="action-button" href="/questionnaire">Get started free <span aria-hidden="true">↗</span></Link>
      </div><div className="feature-card plan-card"><span className="plan-tag">{process.env.BILLING_CHECKOUT_ENABLED === 'true' ? '$9.99 PER MONTH' : 'COMING SOON'}</span><h3>AI CreditLab Plus</h3><p>Keep multiple personal or business action plans. For personal credit, download unlimited letter templates and generate up to five AI drafts each calendar month.</p><Link className="action-button" href="/dashboard">{process.env.BILLING_CHECKOUT_ENABLED === 'true' ? 'Explore Plus' : 'Start free'} <span aria-hidden="true">↗</span></Link></div></div>
    </section>
    <footer className="home-footer"><div className="home-container"><strong>AI CreditLab<span className="brand-mark">.</span></strong><p>Educational tools for your next credit move. Review your own information and seek qualified help when you need it.</p><small>© {new Date().getFullYear()} AI CreditLab</small></div></footer>
  </div>;
}
