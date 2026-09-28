export type CreditAnswers = Record<number, string[]>;

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
