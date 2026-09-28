import { letterTemplateFor } from './letterTemplates';

export type LetterDetails = {
  fullName: string; address: string; agency: string; creditor: string;
  accountReference: string; errorDescription: string; requestedCorrection: string; templateId?: string;
};

export function buildDisputeLetter(details: LetterDetails, date: string) {
  const { fullName, address, agency, creditor, accountReference, errorDescription, requestedCorrection } = details;
  const subject = details.templateId ? letterTemplateFor(details.templateId)?.subject : undefined;
  return `${date}\n\n${fullName}\n${address}\n\nTo: ${agency} dispute department\n\nSubject: Dispute of ${subject ?? 'inaccurate credit report information'}\n\nTo whom it may concern:\n\nI am writing to dispute information on my credit report regarding ${creditor}${accountReference ? ` (account reference: ${accountReference})` : ''}.\n\nThe information I believe is inaccurate is: ${errorDescription}\n\nI request that you investigate this item and ${requestedCorrection}. I have enclosed copies of any documents I have that support my explanation, and a copy of the relevant section of my credit report if available. Please send me the results of your investigation and an updated report if the information is corrected.\n\nSincerely,\n${fullName}\n\nBefore sending: add the bureau's current mailing address, your report confirmation number if available, and copies of relevant evidence. Keep copies of everything you send.`;
}
