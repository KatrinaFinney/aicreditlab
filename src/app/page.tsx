import Link from 'next/link';
import PlanLink from '@/components/PlanLink';

const steps = [
  ['01', 'Get your bearings', 'Answer three short questions for a starting plan. Review your report and identify the specific information you believe is wrong.'],
  ['02', 'Put your facts to work', 'Choose a personal dispute template and add the error, your explanation, and the correction you are requesting. Plus adds AI-assisted wording.'],
  ['03', 'Review. Send. Stay organized.', 'Check your draft, add supporting records, and send it yourself. Manually update dispute statuses as responses arrive.'],
];
const faqs = [
  ['Can I dispute errors without paying for a tool?', 'Yes. You can dispute errors directly with the credit reporting companies and the business that reported the information for free. AI CreditLab provides optional planning, letter preparation, and organization tools; you still review and send your own disputes.'],
  ['What can I do for free?', 'Preview a credit action plan, create an account to save it, track your progress, and customize personal dispute letter templates. The free plan includes three template-letter downloads per UTC calendar month. After that, template access unlocks again next month.'],
  ['Do you send dispute letters for me?', 'No. You customize and review each draft, add supporting records, and send it yourself. AI CreditLab does not contact credit bureaus or creditors on your behalf.'],
  ['Do I need to upload my credit report?', 'No credit report upload is required. Start with your goals. If you prepare a dispute, enter the specific error and facts you want the recipient to review.'],
  ['Can you guarantee a higher score or remove accurate information?', 'No. These tools help you organize your steps and prepare letters about information you believe is inaccurate. Outcomes depend on your situation; accurate negative information generally cannot be removed through a dispute.'],
  ['What does the paid plan add?', 'The $9.99 monthly plan adds multiple saved plans, unlimited personal template downloads, and five AI-assisted letter drafts per UTC calendar month. Template letters use a structured format; AI drafts use your entered facts to suggest wording. You review every draft before sending.'],
  ['Are business credit tools included?', 'Yes. You can create a business credit action plan focused on setup, banking, payment history, and financing preparation. The dispute letter tools are for personal credit reports.'],
];
export default function Home() {
  const checkoutEnabled = process.env.BILLING_CHECKOUT_ENABLED === 'true';
  return <div className="home">
    <section className="home-hero"><div className="home-container home-hero-grid">
      <div><p className="eyebrow">DIY credit repair. A clearer dispute strategy.</p>
        <h1>Credit disputes. <span>Less guesswork. More game plan.</span></h1>
        <p className="hero-copy">Take the guesswork out of disputing credit report mistakes. Build a starting plan, put your facts into a clear letter, and keep track of your next move. You review and send. Plus adds AI-assisted drafting.</p>
        <div className="home-actions"><PlanLink className="action-button" source="hero">Build my free plan</PlanLink><Link className="preview-link" href="/preview">Preview a dispute letter</Link></div>
        <p className="hero-note"><strong>Free plan + 3 template-letter downloads per month.</strong><br />No credit card required. No credit report upload.</p>
      </div>
      <aside className="hero-panel product-preview" aria-label="Example of your DIY dispute workspace">
        <div className="panel-top">WORKSPACE PREVIEW <span className="sample-label">Example</span></div>
        <h2>Your next move, laid out.</h2>
        <div className="preview-task"><span aria-hidden="true">✓</span><div><strong>Review your credit reports</strong><small className="task-complete">Completed in this example</small></div></div>
        <div className="preview-task"><span aria-hidden="true">2</span><div><strong>Prepare your dispute letter</strong><small>Add the error, your facts, and requested correction.</small></div></div>
        <div className="preview-letter"><span className="sample-label">Letter draft</span><p>“I am writing to dispute the balance reported for this account…”</p><Link href="/preview">See how a template works</Link></div>
        <div className="preview-status"><span>Dispute tracker</span><strong>Draft · Sent · Resolved</strong></div>
        <p className="hero-note">An example of the tools—not a credit outcome.</p>
      </aside>
    </div></section>
    <section id="how-it-works" className="home-section home-container"><p className="eyebrow">How it works</p><h2 className="section-title">From “where do I start?” <span>to a clear next move.</span></h2><div className="steps-grid">{steps.map(([number, title, description]) => <article className="feature-card" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="home-band"><div className="home-container split-grid"><div><p className="eyebrow">For personal report errors</p><h2 className="section-title">A clearer dispute <span>starts with your facts.</span></h2><p>Wrong balance? Duplicate entry? Account you don’t recognize? Start with the specific issue. Choose from 30 personal dispute templates, explain what needs correcting, and download a draft to review and send.</p><Link className="action-button action-button-outline" href="/preview">Try a letter preview</Link></div><div className="feature-card checklist-card"><p className="eyebrow">You stay in control</p><h3>AI assists. You call the shots.</h3><ul><li>Start without uploading a credit report</li><li>Use templates free; get AI-assisted drafts with Plus</li><li>Review, send, and manually track your disputes</li></ul><p>You can dispute credit report errors yourself for free. Our tools help you plan and prepare. We don’t contact bureaus for you or promise removals or score increases. <Link href="/privacy">See how your information is used</Link>.</p></div></div></section>
    <section id="plans" className="home-section home-container"><p className="eyebrow">Simple pricing</p><h2 className="section-title">Start free. <span>Choose more tools when you need them.</span></h2><div className="plans-grid">
      <article className="feature-card plan-card plan-featured"><span className="plan-tag">START HERE</span><h3>Free</h3><p className="price">$0</p><p>Your first steps, letters, and a place to keep track.</p><ul><li>One saved plan with progress tracking</li><li>30 personal dispute letter templates</li><li>3 template downloads per month</li><li>Manual dispute status tracking</li></ul><PlanLink className="action-button" source="pricing">Build my free plan</PlanLink><p className="hero-note">No credit card required.</p></article>
      <article className="feature-card plan-card"><span className="plan-tag">{checkoutEnabled ? 'MORE TOOLS' : 'COMING SOON'}</span><h3>Plus</h3><p className="price">$9.99 <span>/ month</span></p><p>Put AI-assisted wording to work on the facts you provide.</p><ul><li>Multiple saved personal or business plans</li><li>Unlimited personal template downloads</li><li>5 AI-assisted personal letter drafts per month</li><li>Progress and dispute tracking</li></ul>{checkoutEnabled ? <Link className="action-button action-button-outline" href="/dashboard">View upgrade options</Link> : <p className="plan-availability">Paid subscriptions are coming soon. Your free tools are available now.</p>}</article>
    </div><p className="hero-note">Download and AI allowances reset on the first day of each month at 00:00 UTC. AI drafts and dispute letter templates are for personal credit reports.</p></section>
    <section className="home-container home-section faq-section"><p className="eyebrow">Before you start</p><h2 className="section-title">A few helpful answers.</h2><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="home-container final-cta"><h2>Your report. Your facts. Your next move.</h2><p>DIY credit repair starts with a clear plan. Preview yours, then prepare a letter about a mistake you believe needs correcting.</p><PlanLink className="action-button" source="footer">Build my free plan</PlanLink></section>
    <footer className="home-footer"><div className="home-container"><strong>AI CreditLab<span className="brand-mark">.</span></strong><p>DIY credit repair tools for a clearer dispute strategy. Plan, prepare personal dispute letters, and track your next move.</p><nav className="footer-links" aria-label="Information"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/help">Help</Link></nav><small>© {new Date().getFullYear()} AI CreditLab</small></div></footer>
  </div>;
}
