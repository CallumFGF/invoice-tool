# Childminder Invoice

A mobile-first Progressive Web App (PWA) for childminders in Kent, UK.

## Features

- **Families** — Store up to 6 families with multiple children, funding types, and contract details
- **Invoice** — Auto-calculate contract days (weekdays minus bank holidays), input absences/closures, generate a print-ready invoice
- **Settings** — Provider details, hourly rate, and bank details shown on every invoice
- **Offline-ready** — Service worker caches the app shell
- **Installable** — Add to Android home screen via browser "Install app" prompt
- **Invoice reminders** — In-app banner (and native notification, if permitted) appears 2 weeks before month end

## Kent funding data baked in

- Term dates 2025/26 (Autumn, Spring, Summer)
- England bank holidays 2025–2027
- All 6 KCC funding types with correct funded hours per day

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Radix UI primitives)
- **localStorage** — no backend required

---

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub (already on branch `claude/invoice-tool-web-app-a74Y0`)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Leave all settings as default — Vercel auto-detects Next.js
4. Click **Deploy**

No environment variables needed for v1.

## PWA icons

Place two PNG icons in `public/icons/`:

| File | Size |
|------|------|
| `icon-192.png` | 192 × 192 px |
| `icon-512.png` | 512 × 512 px |

These are referenced by `manifest.json` and the Apple touch icon meta tag.
You can generate them quickly at [pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator)
or use any 512 × 512 image (e.g. the Ofsted star or your own logo).

## Print / PDF invoices

On the Invoice tab, tap **Generate Invoice** then **Print / Save PDF**.
The browser's print dialog opens; choose **Save as PDF** to get a portable copy.
All UI chrome is hidden during printing — only the invoice document is shown.

## Payment reference format

In Settings you can customise the reference format using these placeholders:

| Placeholder | Example |
|-------------|---------|
| `{SURNAME}` | SMITH |
| `{MON}` | JAN |
| `{YEAR}` | 2026 |

Default: `{SURNAME}-{MON}{YEAR}` → `SMITH-JAN2026`
