import { NextRequest, NextResponse } from 'next/server';

export { default } from 'next-auth/middleware';

export function middleware(req: NextRequest) {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://www.simesim.co.il',
    'https://simesim.co.il',
    'https://simesim-jjlvc.ondigitalocean.app',
  ];

  const response = NextResponse.next();
  const { origin } = req.nextUrl;
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/api/:path*'],
};
