import { auth } from '@/lib/auth/server';
import { NextRequest } from 'next/server';

const handler = auth.handler();

type Params = { path: string[] };

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  return handler.GET(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  return handler.POST(request, context);
}