import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
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

      if (isApi) return true; // API routes handle their own auth

      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/families', request.nextUrl));
      }
      if (!isLoggedIn && !isOnLogin) {
        return false; // middleware redirects to /login
      }
      return true;
    },
    session({ session, user }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id = user.id;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
