import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect only in production and only from "/"
  if (process.env.NODE_ENV === 'production' && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/waitlist';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply only to root path
export const config = {
  matcher: '/',
};
