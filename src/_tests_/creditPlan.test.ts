import { generateCreditPlan, isValidCreditAnswers } from '../lib/creditPlan';

describe('credit plan', () => {
  it('responds to selected challenges without promising removal of accurate information', () => {
    const plan = generateCreditPlan({ 1: ['High credit utilization', 'Collections'], 2: ['Increase credit score'], 3: ['I budget carefully'] });
    expect(plan.join(' ')).toMatch(/card balance/);
    expect(plan.join(' ')).toMatch(/collection/);
    expect(plan.join(' ')).not.toMatch(/remove negative items/i);
  });

  it('gives a usable next action for other answers', () => {
    expect(generateCreditPlan({ 1: ['No credit history'], 2: ['Build business credit'], 3: ['I budget carefully'] }).length).toBeGreaterThan(1);
  });

  it('rejects malformed or invented questionnaire choices', () => {
    expect(isValidCreditAnswers({ 1: ['Collections'], 2: ['Increase credit score'], 3: ['I budget carefully'] })).toBe(true);
    expect(isValidCreditAnswers({ 1: ['Anything'], 2: ['Increase credit score'], 3: ['I budget carefully'] })).toBe(false);
    expect(isValidCreditAnswers({ 1: ['Collections', 'Collections'], 2: ['Increase credit score'], 3: ['I budget carefully'] })).toBe(false);
  });
});


describe('business credit path', () => {
  const answers = { 1: ['Registered, no business bank account'], 2: ['Build a business credit history'], 3: ['Understanding personal guarantees'] };
  it('accepts only business choices for business assessments', () => {
    expect(isValidCreditAnswers(answers, 'business')).toBe(true);
    expect(isValidCreditAnswers(answers, 'personal')).toBe(false);
  });
  it('recommends business banking, reporting, and guarantee checks without consumer disputes', () => {
    const text = generateCreditPlan(answers, 'business').join(' ');
    expect(text).toMatch(/business bank account/);
    expect(text).toMatch(/business credit bureaus/);
    expect(text).toMatch(/personal guarantee/);
    expect(text).not.toMatch(/all three reports/);
  });
});
