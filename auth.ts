import NextAuth from 'next-auth';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';
import { authConfig } from './auth.config';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
});
