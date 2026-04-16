import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const pathname = request.nextUrl.pathname;
      const isOnLogin = pathname.startsWith('/login');
      const isApi = pathname.startsWith('/api');

      if (isApi) return true;
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/families', request.nextUrl));
      }
      if (!isLoggedIn && !isOnLogin) {
        return false;
      }
      return true;
    },
    session({ session, user }) {
      if (session.user && user) {
        (session.user as typeof session.user & { id: string }).id = user.id;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
};
