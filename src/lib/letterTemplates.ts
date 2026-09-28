export const letterTemplates = [
  { id: 'balance', title: 'Incorrect balance', guidance: 'Compare the reported balance with a dated statement or payoff record.', subject: 'Reported balance' },
  { id: 'payment', title: 'Incorrect payment status', guidance: 'Check the month and status against your payment records.', subject: 'Payment history' },
  { id: 'duplicate', title: 'Duplicate account', guidance: 'Identify both entries and explain why they refer to the same account.', subject: 'Duplicate account listing' },
  { id: 'personal', title: 'Incorrect personal information', guidance: 'Identify the inaccurate name, address, or other personal detail and the correct information.', subject: 'Personal information' },
] as const;

export function letterTemplateFor(id: string) {
  return letterTemplates.find((template) => template.id === id);
}
