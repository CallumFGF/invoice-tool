import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import type { Provider } from '@/lib/types';

function mapProvider(row: Record<string, unknown>): Provider {
  return {
    name: (row.name as string) || '',
    businessName: (row.business_name as string) || '',
    address: (row.address as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    ofstedNumber: (row.ofsted_number as string) || '',
    hourlyRate: parseFloat(String(row.hourly_rate)) || 7.0,
    bankAccountName: (row.bank_account_name as string) || '',
    sortCode: (row.sort_code as string) || '',
    accountNumber: (row.account_number as string) || '',
    paymentReferenceFormat: (row.payment_reference_format as string) || '{SURNAME}-{MON}{YEAR}',
  };
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await query<Record<string, unknown>>`
    SELECT * FROM provider_settings WHERE user_id = ${userId}
  `;

  if (!rows.length) {
    return NextResponse.json({
      name: '', businessName: '', address: '', email: '', phone: '',
      ofstedNumber: '', hourlyRate: 7.0, bankAccountName: '', sortCode: '',
      accountNumber: '', paymentReferenceFormat: '{SURNAME}-{MON}{YEAR}',
    } satisfies Provider);
  }

  return NextResponse.json(mapProvider(rows[0]));
}

export async function PUT(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = (await req.json()) as Provider;

  const [row] = await query<Record<string, unknown>>`
    INSERT INTO provider_settings
      (user_id, name, business_name, address, email, phone, ofsted_number,
       hourly_rate, bank_account_name, sort_code, account_number, payment_reference_format)
    VALUES
      (${userId}, ${p.name}, ${p.businessName}, ${p.address}, ${p.email}, ${p.phone},
       ${p.ofstedNumber}, ${p.hourlyRate}, ${p.bankAccountName}, ${p.sortCode},
       ${p.accountNumber}, ${p.paymentReferenceFormat})
    ON CONFLICT (user_id) DO UPDATE SET
      name                     = EXCLUDED.name,
      business_name            = EXCLUDED.business_name,
      address                  = EXCLUDED.address,
      email                    = EXCLUDED.email,
      phone                    = EXCLUDED.phone,
      ofsted_number            = EXCLUDED.ofsted_number,
      hourly_rate              = EXCLUDED.hourly_rate,
      bank_account_name        = EXCLUDED.bank_account_name,
      sort_code                = EXCLUDED.sort_code,
      account_number           = EXCLUDED.account_number,
      payment_reference_format = EXCLUDED.payment_reference_format,
      updated_at               = NOW()
    RETURNING *
  `;

  return NextResponse.json(mapProvider(row));
}
