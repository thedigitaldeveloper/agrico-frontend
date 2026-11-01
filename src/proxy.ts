import { NextResponse, type NextRequest } from 'next/server';

/**
 * Redirects signed-out visitors away from the dashboard.
 *
 * This is a convenience check only — it looks for the presence of the session
 * cookie, not its validity. The proxy runs on every matched request, so
 * verifying the token against the CMS here would add a round trip to each one.
 * The real check happens in the pages, which call getCurrentUser() and are the
 * only place data is actually read.
 */
const SESSION_COOKIE = 'agrico_session';

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname, search } = request.nextUrl;

  if (!hasSession) {
    const login = new URL('/login', request.url);
    // Carries the intended destination so sign-in returns the user to it.
    login.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
