import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, manifest.json, sw.js, icons/ (PWA assets)
     * - api/auth (NextAuth endpoints — handled internally)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons).*)',
  ],
};
