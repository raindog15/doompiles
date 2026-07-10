import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // Forces secure cookies on Vercel production/preview pipelines
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
  },
});