import { readPlanDraft } from '../lib/planDraft';
const now = 1800000000000;
const draft = { version: 1, owner: null, goal: 'personal', answers: { 1: ['Errors on my report'] }, step: 2, updatedAt: now };
it('restores guest choices after signup and binds them to the account', () => {
  expect(readPlanDraft(JSON.stringify(draft), 'user-a', now)).toMatchObject({ owner: 'user-a', answers: draft.answers });
});
it('does not restore another account’s draft', () => {
  expect(readPlanDraft(JSON.stringify({ ...draft, owner: 'user-a' }), 'user-b', now)).toBeNull();
  expect(readPlanDraft(JSON.stringify({ ...draft, owner: 'user-a' }), null, now)).toBeNull();
});
it('rejects expired, corrupt and invalid choices', () => {
  expect(readPlanDraft(JSON.stringify(draft), null, now + 86400001)).toBeNull();
  expect(readPlanDraft('{', null, now)).toBeNull();
  expect(readPlanDraft(JSON.stringify({ ...draft, answers: { 1: ['invented option'] } }), null, now)).toBeNull();
  expect(readPlanDraft(JSON.stringify({ ...draft, goal: 'business' }), null, now)).toBeNull();
});
it('requires complete answers before restoring a preview', () => {
  expect(readPlanDraft(JSON.stringify({ ...draft, step: 4 }), null, now)).toBeNull();
  expect(readPlanDraft(JSON.stringify({ ...draft, step: 4, answers: { 1: ['Errors on my report'], 2: ['Increase credit score'], 3: ['I budget carefully'] } }), null, now)).not.toBeNull();
});
