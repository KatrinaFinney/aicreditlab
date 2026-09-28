import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",          // Homepage
  "/waitlist",  // Email collection page
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();

  // 🔐 Protect all private routes (except public ones)
  if (!authData.userId && !isPublicRoute(req)) {
    return authData.redirectToSignIn({ returnBackUrl: req.url });
  }

});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
