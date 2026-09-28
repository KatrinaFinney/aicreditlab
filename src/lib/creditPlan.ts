export type CreditAnswers = Record<number, string[]>;

export const creditQuestions = [
  { id: 1, question: 'What is your biggest credit challenge?', options: [
    'Late payments', 'High credit utilization', 'Collections', 'No credit history',
    'Errors on my report', 'Too many inquiries',
  ] },
  { id: 2, question: 'What is your primary goal?', options: [
    'Increase credit score', 'Remove negative items', 'Get approved for a loan',
    'Improve financial habits', 'Lower interest rates', 'Build business credit',
  ] },
  { id: 3, question: 'Which best describes your current financial habits?', options: [
    'I budget carefully', 'I sometimes overspend', 'I live paycheck to paycheck',
    'I have savings but struggle with credit', 'I don’t check my credit often',
    'I make payments but carry high balances',
  ] },
];

export function isValidCreditAnswers(value: unknown): value is CreditAnswers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  if (Object.keys(answers).length !== creditQuestions.length) return false;
  return creditQuestions.every(({ id, options }) => {
    const selected = answers[String(id)];
    return Array.isArray(selected) && selected.length >= 1 && selected.length <= 3 &&
      new Set(selected).size === selected.length &&
      selected.every((item: unknown) => typeof item === 'string' && options.includes(item));
  });
}

export function generateCreditPlan(answers: CreditAnswers): string[] {
  const choices = Object.values(answers).flat();
  const steps: string[] = [];

  if (choices.includes("Late payments") || choices.includes("I live paycheck to paycheck"))
    steps.push("List every payment due date and set reminders or autopay for at least the minimum amount you can afford.");
  if (choices.includes("High credit utilization") || choices.includes("I make payments but carry high balances"))
    steps.push("Check each card balance and credit limit; prioritize lowering balances before the next statement date.");
  if (choices.includes("Collections"))
    steps.push("Review each collection on all three reports. Verify the balance, dates, and owner before deciding how to address it.");
  if (choices.includes("Errors on my report") || choices.includes("Remove negative items"))
    steps.push("Get your credit reports, mark specific inaccuracies, and gather documents before disputing only information you believe is wrong.");
  if (choices.includes("No credit history"))
    steps.push("Explore a secured card or credit builder product you can afford, and compare fees before applying.");
  if (choices.includes("Too many inquiries"))
    steps.push("Review recent inquiries and pause unnecessary credit applications while you assess your options.");
  if (choices.includes("I don’t check my credit often"))
    steps.push("Set a monthly reminder to review your reports and track any changes or unfamiliar accounts.");
  if (steps.length === 0)
    steps.push("Review your credit reports and make a list of the factors you can address first.");
  steps.push("Pick one step to work on this week and revisit your plan as your situation changes.");
  return steps;
}
