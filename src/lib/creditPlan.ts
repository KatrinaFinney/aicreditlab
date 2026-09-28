export type CreditAnswers = Record<number, string[]>;
export type CreditGoal = 'personal' | 'business';

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

export const businessQuestions = [
  { id: 1, question: 'Where is your business today?', options: [
    'Still planning', 'Registered, no business bank account', 'Business bank account is open',
    'Already using business credit',
  ] },
  { id: 2, question: 'What do you want business credit to help with?', options: [
    'Separate business and personal finances', 'Build a business credit history',
    'Manage cash flow', 'Prepare for financing', 'Correct an error on a business report',
  ] },
  { id: 3, question: 'What needs attention first?', options: [
    'Business registration or EIN', 'Business bank account', 'Finding reporting vendors or lenders',
    'On-time payments', 'Reviewing business credit reports', 'Understanding personal guarantees',
  ] },
];

export function isValidCreditAnswers(value: unknown, goal: CreditGoal = 'personal'): value is CreditAnswers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  const questions = goal === 'business' ? businessQuestions : creditQuestions;
  if (Object.keys(answers).length !== questions.length) return false;
  return questions.every(({ id, options }) => {
    const selected = answers[String(id)];
    return Array.isArray(selected) && selected.length >= 1 && selected.length <= 3 &&
      new Set(selected).size === selected.length &&
      selected.every((item: unknown) => typeof item === 'string' && options.includes(item));
  });
}

export function generateCreditPlan(answers: CreditAnswers, goal: CreditGoal = 'personal'): string[] {
  const choices = Object.values(answers).flat();
  const steps: string[] = [];
  if (goal === 'business') {
    if (choices.includes('Still planning') || choices.includes('Business registration or EIN'))
      steps.push('Confirm your business structure and registration; obtain an EIN if appropriate for your business.');
    if (choices.includes('Registered, no business bank account') || choices.includes('Business bank account') || choices.includes('Separate business and personal finances'))
      steps.push('Open a business bank account and keep business income and expenses separate from personal transactions.');
    if (choices.includes('Finding reporting vendors or lenders') || choices.includes('Build a business credit history') || choices.includes('Already using business credit'))
      steps.push('Check which business credit bureaus a prospective vendor or lender reports to, and compare costs and terms before applying.');
    if (choices.includes('On-time payments') || choices.includes('Manage cash flow'))
      steps.push('List upcoming business bills and set a reminder to pay each by its due date.');
    if (choices.includes('Prepare for financing') || choices.includes('Understanding personal guarantees'))
      steps.push('Review your cash flow and financing terms, including whether a personal guarantee or personal credit check is required.');
    if (choices.includes('Correct an error on a business report') || choices.includes('Reviewing business credit reports'))
      steps.push('Get the relevant business credit report, identify any specific error, and follow that reporting company’s business dispute process with supporting records.');
    if (steps.length === 0) steps.push('Check your business registration, banking, and existing business credit records to choose a starting point.');
    steps.push('Choose one business credit action for this week; revisit your plan as the business grows.');
    return steps;
  }
  if (choices.includes('Late payments') || choices.includes('I live paycheck to paycheck'))
    steps.push('List every payment due date and set reminders or autopay for at least the minimum amount you can afford.');
  if (choices.includes('High credit utilization') || choices.includes('I make payments but carry high balances'))
    steps.push('Check each card balance and credit limit; prioritize lowering balances before the next statement date.');
  if (choices.includes('Collections'))
    steps.push('Review each collection on all three reports. Verify the balance, dates, and owner before deciding how to address it.');
  if (choices.includes('Errors on my report') || choices.includes('Remove negative items'))
    steps.push('Get your credit reports, mark specific inaccuracies, and gather documents before disputing only information you believe is wrong.');
  if (choices.includes('No credit history'))
    steps.push('Explore a secured card or credit builder product you can afford, and compare fees before applying.');
  if (choices.includes('Too many inquiries'))
    steps.push('Review recent inquiries and pause unnecessary credit applications while you assess your options.');
  if (choices.includes('I don’t check my credit often'))
    steps.push('Set a monthly reminder to review your reports and track any changes or unfamiliar accounts.');
  if (steps.length === 0)
    steps.push('Review your credit reports and make a list of the factors you can address first.');
  steps.push('Pick one step to work on this week and revisit your plan as your situation changes.');
  return steps;
}
