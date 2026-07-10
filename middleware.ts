import { auth } from '@/lib/auth/server';
import { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  console.log('middleware running:', request.nextUrl.pathname);
  return auth.middleware({ loginUrl: '/' })(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};