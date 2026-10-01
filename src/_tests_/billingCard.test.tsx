import { renderToStaticMarkup } from 'react-dom/server';
import { useState } from 'react';
import BillingCard from '../components/BillingCard';
jest.mock('react', () => ({ ...jest.requireActual('react'), useState: jest.fn() }));
afterEach(() => jest.resetAllMocks());
it.each(['personal', 'business'])('keeps subscription management available on a paid %s plan', (accountGoal) => {
  (useState as jest.Mock).mockImplementation((initial) => [initial, jest.fn()]);
  (useState as jest.Mock).mockImplementationOnce(() => [{ accountGoal, paid: true, status: 'active', hasBillingAccount: true, price: '$9.99' }, jest.fn()]);
  const html = renderToStaticMarkup(<BillingCard />);
  expect(html).toContain('Manage subscription');
  expect(html).not.toContain('Get the Letter Boost');
});
it('lets a customer retry an abandoned checkout when no subscription exists', () => {
  (useState as jest.Mock).mockImplementation((initial) => [initial, jest.fn()]);
  (useState as jest.Mock).mockImplementationOnce(() => [{ accountGoal: 'personal', paid: false, status: null, hasBillingAccount: true, price: '$9.99' }, jest.fn()]);
  const html = renderToStaticMarkup(<BillingCard />);
  expect(html).toContain('Get the Letter Boost'); expect(html).toContain('$9.99');
});
