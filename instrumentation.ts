export async function register() {
  // Only run in the Node.js runtime (not Edge), and only when a DB is configured
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.POSTGRES_URL) {
    const { migrate } = await import('./lib/migrate');
    await migrate();
  }
}
