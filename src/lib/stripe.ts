import 'server-only';
import Stripe from 'stripe';

export function getStripe() {
  return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
}

export const monthlyPriceCents = 999;
