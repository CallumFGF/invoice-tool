# Childminder Invoice

A mobile-first Progressive Web App for childminders in Kent, UK.  
**v2** — Google sign-in + Postgres database; data syncs across all devices.

## Features

- **Google sign-in** — data is private and scoped to your account
- **Cross-device sync** — Vercel Postgres (Neon) stores all family and settings data
- **Families** — unlimited families, each with 1+ children
- **Schedule builder** — Simple mode (day pills + time range) or Advanced mode (per-day start/end times)
- **Invoice** — contract days auto-calculated from the actual attending weekdays and bank holidays; print/PDF ready
- **Settings** — provider details, hourly rate, bank details
- **PWA** — installable on Android, works offline
- **Invoice reminders** — banner + native notification 14 days before month end

## Setup

### 1 · Clone and install

```bash
git clone https://github.com/callumfgf/invoice-tool
cd invoice-tool
npm install
```

### 2 · Create a Vercel Postgres database

1. Go to [vercel.com](https://vercel.com) → your project → **Storage** → **Create Database** → **Postgres**
2. After creation, click **Connect to Project**
3. Go to **.env.local** tab → copy the `POSTGRES_URL` value

### 3 · Run the database schema

1. In the Vercel dashboard → Storage → your DB → **Query** tab
2. Paste the contents of `scripts/schema.sql` and run it

### 4 · Set up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)
4. Copy the Client ID and Client Secret

### 5 · Environment variables

Create `.env.local` in the project root:

```env
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_GOOGLE_ID=<from Google Cloud Console>
AUTH_GOOGLE_SECRET=<from Google Cloud Console>
POSTGRES_URL=<from Vercel Postgres>
```

In Vercel dashboard → your project → **Settings → Environment Variables** → add the same four variables.

### 6 · Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7 · Deploy

```bash
git push origin main
```

Vercel picks up the push and deploys automatically.

---

## Schedule modes

**Simple** — set which days (Mon–Fri pills) and a single start/end time.  
**Advanced** — toggle each day individually with its own start and end time.

The billing engine counts the exact weekdays the child attends in a given month (minus bank holidays) to calculate contract days — no more approximate scaling.

## PWA icons

Add two PNGs to `public/icons/`:

| File | Size |
|------|------|
| `icon-192.png` | 192 × 192 |
| `icon-512.png` | 512 × 512 |

## Payment reference format

Placeholders: `{SURNAME}`, `{MON}`, `{YEAR}`  
Default: `{SURNAME}-{MON}{YEAR}` → `SMITH-JAN2026`
