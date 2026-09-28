import { generateCreditPlan } from '../lib/creditPlan';

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
});
