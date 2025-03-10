import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth(); // Ensure it's awaited
  if (!authData.userId && !isPublicRoute(req)) {
    return authData.redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
