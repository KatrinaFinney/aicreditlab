import { buildDisputeLetter } from '../lib/disputeLetter';

it('uses the specific reported error and requested correction in a reviewable draft', () => {
  const letter = buildDisputeLetter({ fullName: 'Alex Example', address: '123 Main St', agency: 'Experian',
    creditor: 'Example Bank', accountReference: '1234', errorDescription: 'The balance is reported as $500, but my statement says $0.',
    requestedCorrection: 'correct the balance to $0' }, 'September 28, 2026');
  expect(letter).toContain('The balance is reported as $500');
  expect(letter).toContain('correct the balance to $0');
  expect(letter).toContain('Before sending:');
});

it('customizes the subject for a free library template', () => {
  const letter = buildDisputeLetter({ fullName: 'Alex Example', address: '123 Main St', agency: 'Equifax',
    creditor: 'Example Bank', accountReference: '', errorDescription: 'The payment was on time.',
    requestedCorrection: 'correct the reported payment status', templateId: 'payment' }, 'September 28, 2026');
  expect(letter).toContain('Subject: Dispute of Payment history');
  expect(letter).toContain('The payment was on time.');
});
