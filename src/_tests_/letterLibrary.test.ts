import { letterTemplates } from '../lib/letterTemplates';
import { buildDisputeLetter } from '../lib/disputeLetter';
import { validLetterDetails } from '../lib/validateLetter';

it('offers thirty distinct issue-specific starting points', () => {
  expect(letterTemplates).toHaveLength(30);
  expect(new Set(letterTemplates.map((item) => item.id)).size).toBe(30);
  expect(new Set(letterTemplates.map((item) => item.subject)).size).toBeGreaterThan(20);
  for (const template of letterTemplates) {
    expect(template.guidance.length).toBeGreaterThan(25);
    const details = { fullName: 'Alex Example', address: '123 Main St', agency: 'Equifax',
      creditor: 'Example Bank', accountReference: '1234', errorDescription: 'Specific reported error',
      requestedCorrection: 'correct the specific error', templateId: template.id };
    expect(validLetterDetails(details)).toBe(true);
    expect(buildDisputeLetter(details, 'September 28, 2026')).toContain(`Subject: Dispute of ${template.subject}`);
  }
});

it('rejects an invented template identifier', () => {
  expect(validLetterDetails({ fullName: 'Alex', address: '123 Main St', agency: 'Equifax',
    creditor: 'Example Bank', errorDescription: 'Error', requestedCorrection: 'Correct it', templateId: 'fabricated' })).toBe(false);
});
