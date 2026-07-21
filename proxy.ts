import { auth } from '@/lib/auth/server';
import { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  console.log('middleware hit:', request.nextUrl.pathname);
  return auth.middleware({ loginUrl: '/' })(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};