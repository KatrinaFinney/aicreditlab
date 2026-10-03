import Link from 'next/link';

const steps = [
  ['01', 'Tell us your goal', 'Choose personal or business credit. Answer a few questions about where you are and what you want to work on.'],
  ['02', 'Get your game plan', 'Get focused next steps for your goals, so you can spend less time searching and more time getting started.'],
  ['03', 'Make moves at your pace', 'Take on a manageable task, save your progress, and come back when life gives you room.'],
];

export default function Home() {
  return <div className="home">
    <section className="home-hero">
      <div className="home-container home-hero-grid">
        <div>
          <p className="eyebrow">Your next credit move starts here</p>
          <h1>Less credit stress. <span>A clear next step.</span></h1>
          <p className="hero-copy">You don’t have to figure it all out today. Answer a few questions and turn your personal or business credit goals into a manageable plan. Know what to focus on, what to do next, and where you left off.</p>
          <div className="home-actions">
            <Link className="action-button" href="/questionnaire">Build my free plan</Link>
            <Link className="action-button action-button-outline" href="#how-it-works">How it works</Link>
          </div>
          <p className="hero-note">Free to start. No card needed. No credit report upload.</p>
        </div>
        <aside className="hero-panel" aria-label="Your next steps">
          <div className="panel-top"><span className="panel-orbit" aria-hidden="true">✦</span><span>YOUR CREDIT WORKSPACE</span><span className="panel-dot" aria-hidden="true" /></div>
          <p className="panel-label">One step is enough to start.</p>
          <h2>Less overwhelm.<br />More direction.</h2>
          <div className="mini-step"><span>01</span><p>Choose your next priority</p><span aria-hidden="true">↗</span></div>
          <div className="mini-step"><span>02</span><p>Work at your own pace</p><span aria-hidden="true">↗</span></div>
          <div className="mini-step"><span>03</span><p>Save progress as you go</p><span aria-hidden="true">↗</span></div>
          <div className="panel-bottom">Made for real life, not a perfect schedule.</div>
        </aside>
      </div>
    </section>
    <section id="how-it-works" className="home-section home-container">
      <p className="eyebrow">How it works</p>
      <h2 className="section-title">From “where do I start?” <span>to “I can do this.”</span></h2>
      <div className="steps-grid">{steps.map(([number, title, description]) => <article className="feature-card" key={number}>
        <span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p>
      </article>)}</div>
    </section>
    <section className="home-band"><div className="home-container split-grid">
      <div><p className="eyebrow">For mistakes on personal reports</p>
        <h2 className="section-title">Found a report error? <span>Find the words.</span></h2>
        <p>A blank page shouldn’t hold you up. Choose from 30 letter templates for personal credit report errors, add your facts, and download a draft to review and send yourself.</p>
        <Link className="action-button" href="/dispute-center">Find my letter template</Link>
      </div>
      <div className="feature-card checklist-card"><p className="eyebrow">You’re in the driver’s seat</p><h3>Clear words. Your facts.</h3>
        <ul><li>Start with the issue you actually found</li><li>Make the draft yours</li><li>Keep your supporting records close</li></ul>
        <p>You review and send the letter. We don’t contact bureaus for you or promise a particular outcome.</p>
      </div>
    </div></section>
    <section id="plans" className="home-section home-container"><p className="eyebrow">Pick your starting point</p>
      <h2 className="section-title">Your first move <span>doesn’t need a subscription.</span></h2>
      <div className="plans-grid"><div className="feature-card plan-card plan-featured"><span className="plan-tag">FREE TO START</span><h3>The Starter Plan</h3><p>Get a plan, a place to track progress, and letter tools you can use today.</p>
        <ul><li>Separate personal and business credit action plans</li><li>Saved progress, focus mode, and short work sessions</li><li>Personal credit: 30 customizable letter topics; three downloads per month</li><li>Manual dispute status tracking</li></ul>
        <Link className="action-button" href="/questionnaire">Build my free plan</Link>
      </div><div className="feature-card plan-card"><span className="plan-tag">PERSONAL CREDIT</span><h3>The Letter Boost{process.env.BILLING_CHECKOUT_ENABLED !== 'true' ? ' · Coming soon' : ''}</h3><p>$9.99 per month gets you multiple saved plans, unlimited personal template downloads, and up to five AI letter drafts each UTC calendar month. {process.env.BILLING_CHECKOUT_ENABLED === 'true' ? 'Check your dashboard for checkout availability.' : 'Subscriptions are coming soon. Start with your free plan today.'}</p></div></div>
    </section>
    <footer className="home-footer"><div className="home-container"><strong>AI CreditLab<span className="brand-mark">.</span></strong><p>Educational tools for your next credit move. Review your own information and seek qualified help when you need it.</p><small>© {new Date().getFullYear()} AI CreditLab</small></div></footer>
  </div>;
}
