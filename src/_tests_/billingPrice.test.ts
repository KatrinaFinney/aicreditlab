import type Stripe from 'stripe';
import { isPersonalMonthlyPrice } from '../lib/billingPrice';

const price = { active: true, type: 'recurring', currency: 'usd', unit_amount: 999,
  recurring: { interval: 'month', interval_count: 1 } } as Stripe.Price;

it('accepts only the agreed $9.99 USD monthly offer', () => {
  expect(isPersonalMonthlyPrice(price)).toBe(true);
  expect(isPersonalMonthlyPrice({ ...price, unit_amount: 1999 })).toBe(false);
  expect(isPersonalMonthlyPrice({ ...price, currency: 'eur' })).toBe(false);
  expect(isPersonalMonthlyPrice({ ...price, recurring: { ...price.recurring!, interval_count: 2 } })).toBe(false);
  expect(isPersonalMonthlyPrice({ ...price, active: false })).toBe(false);
});
