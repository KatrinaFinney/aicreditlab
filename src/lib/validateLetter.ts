import { letterTemplateFor } from './letterTemplates';
import type { LetterDetails } from './disputeLetter';

export function validLetterDetails(value: unknown): value is LetterDetails {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  return ['fullName', 'address', 'creditor', 'errorDescription', 'requestedCorrection']
    .every((key) => typeof input[key] === 'string' && !!(input[key] as string).trim() && (input[key] as string).length <= 1000) &&
    ['Equifax', 'Experian', 'TransUnion'].includes(input.agency as string) &&
    typeof input.templateId === 'string' && !!letterTemplateFor(input.templateId) &&
    (input.accountReference === '' || input.accountReference === undefined ||
      (typeof input.accountReference === 'string' && input.accountReference.length <= 30));
}
