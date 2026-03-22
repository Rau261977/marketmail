import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('auth-session');
  const { pathname } = request.nextUrl;

  // Define protected and public routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/audience') || 
                          pathname.startsWith('/templates') || 
                          pathname.startsWith('/campaigns') || 
                          pathname.startsWith('/automation') || 
                          pathname.startsWith('/settings');
  
  const isAuthRoute = pathname === '/login';

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
