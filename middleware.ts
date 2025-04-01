import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",        // Homepage (we'll intercept this)
  "/sign-in",
  "/sign-up",
  "/waitlist",
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();

  const { pathname } = req.nextUrl;

  // TEMPORARY: Redirect "/" to "/waitlist" only in production
  if (
    process.env.NODE_ENV === "production" &&
    pathname === "/"
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/waitlist";
    return NextResponse.redirect(url);
  }

  // Protect all other non-public routes
  if (!authData.userId && !isPublicRoute(req)) {
    return authData.redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"], // standard
};
