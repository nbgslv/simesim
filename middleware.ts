import { NextRequest, NextResponse } from 'next/server';

export { default } from 'next-auth/middleware';
const COOKIE_NAME = 'bucket-marketing';
const MARKETING_BUCKETS = ['a', 'b'] as const;
const getBucket = () =>
  MARKETING_BUCKETS[Math.floor(Math.random() * MARKETING_BUCKETS.length)];

export function middleware(req: NextRequest) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://www.simesim.co.il',
    'https://simesim.co.il',
    'https://simesim-jjlvc.ondigitalocean.app',
  ];

  let response = NextResponse.next();
  const { origin, pathname, search } = req.nextUrl;
  if (
    (pathname.startsWith('/api') || pathname.startsWith('/login')) &&
    allowedOrigins.includes(origin)
  ) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (pathname === '/' && search === '') {
    // Testing marketing buckets
    const bucket = req.cookies.get(COOKIE_NAME) || getBucket();
    if (bucket === 'b') {
      response = NextResponse.redirect(new URL(`/?mvt=${bucket}`, origin));
    }
    if (!req.cookies.get(COOKIE_NAME)) {
      response.cookies.set(COOKIE_NAME, bucket);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/api/:path*', '/login', '/'],
};
