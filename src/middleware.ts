import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",          // Homepage
  "/questionnaire",
  "/preview",
  "/privacy",
  "/terms",
  "/help",
  "/waitlist",  // Email collection page
  "/sign-in",
  "/sign-up",
  "/api/billing/webhook", // Stripe signs each event; no Clerk session is present.
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();

  // 🔐 Protect all private routes (except public ones)
  if (!authData.userId && !isPublicRoute(req)) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.url);
    return Response.redirect(url, 307);
  }

});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
