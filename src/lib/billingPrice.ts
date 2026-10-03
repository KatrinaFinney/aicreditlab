import type Stripe from 'stripe';

export const PERSONAL_MONTHLY_PRICE_CENTS = 999;

export function isPersonalMonthlyPrice(price: Stripe.Price) {
  return price.active && price.type === 'recurring' && price.currency.toLowerCase() === 'usd' &&
    price.unit_amount === PERSONAL_MONTHLY_PRICE_CENTS && price.recurring?.interval === 'month' &&
    price.recurring?.interval_count === 1;
}
