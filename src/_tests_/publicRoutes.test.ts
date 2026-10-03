const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: unknown) => handler,
  createRouteMatcher: (routes: string[]) => (request: Request) => routes.includes(new URL(request.url).pathname),
}));
import middleware from '../middleware';
const run = middleware as unknown as (auth: typeof mockAuth, request: Request) => Promise<Response | undefined>;
beforeEach(() => mockAuth.mockResolvedValue({ userId: null }));
it.each(['/questionnaire', '/preview', '/privacy', '/terms', '/help', '/sign-up', '/sign-in'])('keeps %s public', async path => {
  expect(await run(mockAuth, new Request(`https://www.aicreditlab.com${path}`))).toBeUndefined();
});
it.each(['/dashboard', '/api/credit-plan', '/api/letter-download', '/api/paid-letter'])('keeps %s protected with branded sign-in', async path => {
  const response = await run(mockAuth, new Request(`https://www.aicreditlab.com${path}`));
  expect(response?.status).toBe(307);
  const location = new URL(response!.headers.get('location')!);
  expect(location.origin).toBe('https://www.aicreditlab.com');
  expect(location.pathname).toBe('/sign-in');
  expect(location.searchParams.get('redirect_url')).toBe(`https://www.aicreditlab.com${path}`);
});
it('allows signed-in access to saved work', async () => {
  mockAuth.mockResolvedValue({ userId: 'user-a' });
  expect(await run(mockAuth, new Request('https://www.aicreditlab.com/dashboard'))).toBeUndefined();
});
