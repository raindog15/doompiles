import { auth } from '@/lib/auth/server';
import { NextRequest } from 'next/server';

const handler = auth.handler();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest, context: any) {
  console.log('auth route hit:', request.url);
  return handler.GET(request, context);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: NextRequest, context: any) {
  console.log('auth route hit:', request.url);  
  return handler.POST(request, context);
}