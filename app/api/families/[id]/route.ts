import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import type { Family, Child, FundingType, Schedule } from '@/lib/types';

function mapChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    name: row.name as string,
    dateOfBirth: (row.date_of_birth as string) || '',
    fundingType: (row.funding_type as FundingType) || 'none',
    schedule: row.schedule as Schedule,
  };
}

// ── PUT /api/families/[id] ────────────────────────────────────────────────────

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as Family;
  const { surname, parentName, address, email, phone, children } = body;

  // Verify ownership
  const rows = await query<{ id: string }>`
    SELECT id FROM families WHERE id = ${params.id} AND user_id = ${userId}
  `;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Update family
  await query`
    UPDATE families
    SET surname = ${surname}, parent_name = ${parentName}, address = ${address ?? ''},
        email = ${email ?? ''}, phone = ${phone ?? ''}, updated_at = NOW()
    WHERE id = ${params.id}
  `;

  // Replace children: delete all then re-insert
  await query`DELETE FROM children WHERE family_id = ${params.id}`;

  const savedChildren: Record<string, unknown>[] = [];
  for (const child of children ?? []) {
    const [c] = await query<Record<string, unknown>>`
      INSERT INTO children (family_id, name, date_of_birth, funding_type, schedule)
      VALUES (${params.id}, ${child.name}, ${child.dateOfBirth ?? ''}, ${child.fundingType}, ${JSON.stringify(child.schedule)})
      RETURNING id, name, date_of_birth, funding_type, schedule
    `;
    savedChildren.push(c);
  }

  const updated: Family = {
    id: params.id,
    surname,
    parentName,
    address: address ?? '',
    email: email ?? '',
    phone: phone ?? '',
    children: savedChildren.map(mapChild),
  };

  return NextResponse.json(updated);
}

// ── DELETE /api/families/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await query<{ id: string }>`
    SELECT id FROM families WHERE id = ${params.id} AND user_id = ${userId}
  `;
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await query`DELETE FROM families WHERE id = ${params.id}`;

  return new Response(null, { status: 204 });
}
