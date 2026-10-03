import Link from 'next/link';
import PlanLink from '@/components/PlanLink';

const steps = [
  ['01', 'Tell us your goal', 'Choose personal or business credit and answer three short questions.'],
  ['02', 'Preview your plan', 'See practical next steps before you create an account.'],
  ['03', 'Save and take action', 'Track your progress. For personal report errors, customize a letter and download it to review and send.'],
];
const faqs = [
  ['What can I do for free?', 'Preview a credit action plan, create an account to save it, track your progress, and customize personal dispute letter templates. The free plan includes three template-letter downloads per UTC calendar month. After that, template access unlocks again next month.'],
  ['Do you send dispute letters for me?', 'No. You customize and review each draft, add supporting records, and send it yourself. AI CreditLab does not contact credit bureaus or creditors on your behalf.'],
  ['Do I need to upload my credit report?', 'No credit report upload is required. Start with your goals. If you prepare a dispute, enter the specific error and facts you want the recipient to review.'],
  ['Can you guarantee a higher score or remove accurate information?', 'No. These tools help you organize your steps and prepare letters about information you believe is inaccurate. Outcomes depend on your situation; accurate negative information is not guaranteed to be removed.'],
  ['What does the paid plan add?', 'The $9.99 monthly plan adds multiple saved plans, unlimited personal template downloads, and five AI-assisted letter drafts per UTC calendar month. Template letters use a structured format; AI drafts use your entered facts to suggest wording. You review every draft before sending.'],
  ['Are business credit tools included?', 'Yes. You can create a business credit action plan focused on setup, banking, payment history, and financing preparation. The dispute letter tools are for personal credit reports.'],
];
export default function Home() {
  const checkoutEnabled = process.env.BILLING_CHECKOUT_ENABLED === 'true';
  return <div className="home">
    <section className="home-hero"><div className="home-container home-hero-grid">
      <div><p className="eyebrow">Your credit. Your next step.</p>
        <h1>Credit repair, simplified. <span>Disputes made easy.</span></h1>
        <p className="hero-copy">Create your credit action plan, customize letters to dispute report errors, and track your next steps.</p>
        <div className="home-actions"><PlanLink className="action-button" source="hero">Create my free plan</PlanLink><Link className="preview-link" href="/preview">Preview a dispute letter</Link></div>
        <p className="hero-note"><strong>Free plan + 3 template-letter downloads per month.</strong><br />No credit card required. No credit report upload.</p>
      </div>
      <aside className="hero-panel product-preview" aria-label="Example of your credit workspace">
        <div className="panel-top">WORKSPACE PREVIEW <span className="sample-label">Example</span></div>
        <h2>A place for every next step.</h2>
        <div className="preview-task"><span aria-hidden="true">✓</span><div><strong>Review your credit reports</strong><small className="task-complete">Completed in this example</small></div></div>
        <div className="preview-task"><span aria-hidden="true">2</span><div><strong>Prepare your dispute letter</strong><small>Add the error, your facts, and requested correction.</small></div></div>
        <div className="preview-letter"><span className="sample-label">Letter draft</span><p>“I am writing to dispute the balance reported for this account…”</p><Link href="/preview">See how a template works</Link></div>
        <div className="preview-status"><span>Dispute tracker</span><strong>Draft · Sent · Resolved</strong></div>
        <p className="hero-note">An example of the tools—not a credit outcome.</p>
      </aside>
    </div></section>
    <section id="how-it-works" className="home-section home-container"><p className="eyebrow">How it works</p><h2 className="section-title">Your credit plan. <span>Three simple steps.</span></h2><div className="steps-grid">{steps.map(([number, title, description]) => <article className="feature-card" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="home-band"><div className="home-container split-grid"><div><p className="eyebrow">For personal report errors</p><h2 className="section-title">Dispute letters, <span>without the blank page.</span></h2><p>Choose from 30 templates, add the facts about your report error, and download a draft to review and send yourself.</p><Link className="action-button action-button-outline" href="/preview">Try a letter preview</Link></div><div className="feature-card checklist-card"><p className="eyebrow">You stay in control</p><h3>Your facts. Your final review.</h3><ul><li>No credit report upload required</li><li>Review and send each letter yourself</li><li>Track dispute statuses in your workspace</li></ul><p>We don’t contact bureaus for you or guarantee removals or score increases. <Link href="/privacy">See how your information is used</Link>.</p></div></div></section>
    <section id="plans" className="home-section home-container"><p className="eyebrow">Simple pricing</p><h2 className="section-title">Start free. <span>Choose more tools when you need them.</span></h2><div className="plans-grid">
      <article className="feature-card plan-card plan-featured"><span className="plan-tag">START HERE</span><h3>Free</h3><p className="price">$0</p><p>Your starting point for personal or business credit.</p><ul><li>One saved plan with progress tracking</li><li>30 personal dispute letter templates</li><li>3 template downloads per month</li><li>Manual dispute status tracking</li></ul><PlanLink className="action-button" source="pricing">Create my free plan</PlanLink><p className="hero-note">No credit card required.</p></article>
      <article className="feature-card plan-card"><span className="plan-tag">{checkoutEnabled ? 'MORE TOOLS' : 'COMING SOON'}</span><h3>Plus</h3><p className="price">$9.99 <span>/ month</span></p><p>More room to organize your plans and draft your letters.</p><ul><li>Multiple saved personal or business plans</li><li>Unlimited personal template downloads</li><li>5 AI-assisted personal letter drafts per month</li><li>Progress and dispute tracking</li></ul>{checkoutEnabled ? <Link className="action-button action-button-outline" href="/dashboard">View upgrade options</Link> : <p className="plan-availability">Paid subscriptions are coming soon. Your free tools are available now.</p>}</article>
    </div><p className="hero-note">Download and AI allowances reset on the first day of each month at 00:00 UTC. AI drafts and dispute letter templates are for personal credit reports.</p></section>
    <section className="home-container home-section faq-section"><p className="eyebrow">Before you start</p><h2 className="section-title">A few helpful answers.</h2><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="home-container final-cta"><h2>Start with one clear next step.</h2><p>Preview your plan. Save it when you’re ready.</p><PlanLink className="action-button" source="footer">Create my free plan</PlanLink></section>
    <footer className="home-footer"><div className="home-container"><strong>AI CreditLab<span className="brand-mark">.</span></strong><p>DIY educational tools for your credit action plan and personal dispute letters.</p><nav className="footer-links" aria-label="Information"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/help">Help</Link></nav><small>© {new Date().getFullYear()} AI CreditLab</small></div></footer>
  </div>;
}
