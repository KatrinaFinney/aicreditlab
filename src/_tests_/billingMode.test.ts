import { assertBillingMode } from '../lib/billing';
jest.mock('../lib/serverSupabase', () => ({ getServerSupabase: jest.fn() }));
const previous = { ...process.env };
afterEach(() => { process.env = { ...previous }; });
it('rejects test-mode billing on the shared database even in previews', () => {
  process.env.VERCEL_ENV = 'preview';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://wsnnriiqkcvazkvhrwdm.supabase.co';
  process.env.BILLING_TEST_DATABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  expect(() => assertBillingMode(false)).toThrow();
});
it('requires an explicit matching isolated database and forbids production test billing', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://isolated-test.supabase.co';
  delete process.env.BILLING_TEST_DATABASE_URL;
  expect(() => assertBillingMode(false)).toThrow();
  process.env.BILLING_TEST_DATABASE_URL = 'https://different.supabase.co';
  expect(() => assertBillingMode(false)).toThrow();
  process.env.BILLING_TEST_DATABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.VERCEL_ENV = 'preview'; expect(() => assertBillingMode(false)).not.toThrow();
  process.env.VERCEL_ENV = 'production'; expect(() => assertBillingMode(false)).toThrow();
});
it('permits live billing without a test database marker', () => {
  delete process.env.BILLING_TEST_DATABASE_URL; expect(() => assertBillingMode(true)).not.toThrow();
});
