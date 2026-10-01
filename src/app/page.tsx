import Link from 'next/link';

const steps = [
  ['01', 'Tell us your goal', 'Personal credit or business credit? Start with the path that fits you.'],
  ['02', 'Get your game plan', 'Turn your answers into clear next steps, without the 47 open tabs.'],
  ['03', 'Make moves at your pace', 'Check off what you finish and pick up right where you left off.'],
];

export default function Home() {
  return <div className="home">
    <section className="home-hero">
      <div className="home-container home-hero-grid">
        <div>
          <p className="eyebrow">Credit clarity, minus the chaos</p>
          <h1>Get your credit together. <span>One move at a time.</span></h1>
          <p className="hero-copy">No shame. No 47 open tabs. Pick personal or business credit, answer a few questions, and get a plan you can actually follow. Spot a mistake on a personal credit report? Draft a letter you can review and send yourself.</p>
          <div className="home-actions">
            <Link className="action-button" href="/questionnaire">Make my free game plan <span aria-hidden="true">↗</span></Link>
            <Link className="action-button action-button-outline" href="#how-it-works">How it works</Link>
          </div>
          <p className="hero-note">Free to start <span aria-hidden="true">·</span> No credit report upload required</p>
        </div>
        <aside className="hero-panel" aria-label="Your next steps">
          <div className="panel-top"><span className="panel-orbit" aria-hidden="true">✦</span><span>YOUR CREDIT WORKSPACE</span><span className="panel-dot" aria-hidden="true" /></div>
          <p className="panel-label">Five minutes counts.</p>
          <h2>Small moves.<br />Real momentum.</h2>
          <div className="mini-step"><span>01</span><p>See what matters next</p><span aria-hidden="true">↗</span></div>
          <div className="mini-step"><span>02</span><p>Make a little time</p><span aria-hidden="true">↗</span></div>
          <div className="mini-step"><span>03</span><p>Keep track of your wins</p><span aria-hidden="true">↗</span></div>
          <div className="panel-bottom">Made for real life, not a perfect schedule.</div>
        </aside>
      </div>
    </section>
    <section id="how-it-works" className="home-section home-container">
      <p className="eyebrow">How it works</p>
      <h2 className="section-title">A plan, <span>not another homework assignment.</span></h2>
      <div className="steps-grid">{steps.map(([number, title, description]) => <article className="feature-card" key={number}>
        <span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p>
      </article>)}</div>
    </section>
    <section className="home-band"><div className="home-container split-grid">
      <div><p className="eyebrow">For mistakes on personal reports</p>
        <h2 className="section-title">Spot an error? <span>Put it in writing.</span></h2>
        <p>Meet the Letter Lab: 30 starting points for specific personal credit report errors. Add your facts, review your draft, and gather supporting records before you send it yourself.</p>
        <Link className="action-button" href="/dispute-center">Explore the Letter Lab <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="feature-card checklist-card"><p className="eyebrow">You’re in the driver’s seat</p><h3>Clear words. Your facts.</h3>
        <ul><li>Start with the issue you actually found</li><li>Make the draft yours</li><li>Keep your supporting records close</li></ul>
        <p>You review and send the letter. We don’t contact bureaus for you or promise a particular outcome.</p>
      </div>
    </div></section>
    <section className="home-section home-container"><p className="eyebrow">Pick your starting point</p>
      <h2 className="section-title">Start free. <span>Keep moving.</span></h2>
      <div className="plans-grid"><div className="feature-card plan-card plan-featured"><span className="plan-tag">FREE TO START</span><h3>The Starter Plan</h3><p>A little clarity goes a long way. Start here, then take it one move at a time.</p>
        <ul><li>Separate personal and business credit action plans</li><li>Saved progress, focus mode, and short work sessions</li><li>Personal credit: 30 customizable letter topics; three downloads per month</li><li>Manual dispute status tracking</li></ul>
        <Link className="action-button" href="/questionnaire">Let’s get started <span aria-hidden="true">↗</span></Link>
      </div><div className="feature-card plan-card"><span className="plan-tag">PERSONAL CREDIT</span><h3>The Letter Boost</h3><p>$9.99 per month gets you multiple saved plans, unlimited personal template downloads, and up to five AI letter drafts each UTC calendar month. Check your dashboard for checkout availability.</p></div></div>
    </section>
    <footer className="home-footer"><div className="home-container"><strong>AI CreditLab<span className="brand-mark">.</span></strong><p>Educational tools for your next credit move. Review your own information and seek qualified help when you need it.</p><small>© {new Date().getFullYear()} AI CreditLab</small></div></footer>
  </div>;
}
