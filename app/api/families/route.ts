import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import type { Family, Child, FundingType, Schedule } from '@/lib/types';

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    name: row.name as string,
    dateOfBirth: (row.date_of_birth as string) || '',
    fundingType: (row.funding_type as FundingType) || 'none',
    schedule: row.schedule as Schedule,
  };
}

function mapFamily(
  row: Record<string, unknown>,
  children: Record<string, unknown>[],
): Family {
  return {
    id: row.id as string,
    surname: row.surname as string,
    parentName: row.parent_name as string,
    address: (row.address as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    children: children.map(mapChild),
  };
}

// ── GET /api/families ─────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const families = await query<Record<string, unknown>>`
    SELECT
      f.id, f.surname, f.parent_name, f.address, f.email, f.phone,
      COALESCE(
        json_agg(
          json_build_object(
            'id',            c.id,
            'name',          c.name,
            'date_of_birth', c.date_of_birth,
            'funding_type',  c.funding_type,
            'schedule',      c.schedule
          ) ORDER BY c.created_at
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
      ) AS children
    FROM families f
    LEFT JOIN children c ON c.family_id = f.id
    WHERE f.user_id = ${userId}
    GROUP BY f.id, f.surname, f.parent_name, f.address, f.email, f.phone, f.created_at
    ORDER BY f.surname, f.parent_name
  `;

  const result: Family[] = families.map(row => {
    const kids = (row.children as Record<string, unknown>[]) ?? [];
    return mapFamily(row, kids);
  });

  return NextResponse.json(result);
}

// ── POST /api/families ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as Omit<Family, 'id'>;
  const { surname, parentName, address, email, phone, children } = body;

  const [family] = await query<Record<string, unknown>>`
    INSERT INTO families (user_id, surname, parent_name, address, email, phone)
    VALUES (${userId}, ${surname}, ${parentName}, ${address ?? ''}, ${email ?? ''}, ${phone ?? ''})
    RETURNING id, surname, parent_name, address, email, phone
  `;

  const savedChildren: Record<string, unknown>[] = [];
  for (const child of children ?? []) {
    const [c] = await query<Record<string, unknown>>`
      INSERT INTO children (family_id, name, date_of_birth, funding_type, schedule)
      VALUES (${family.id}, ${child.name}, ${child.dateOfBirth ?? ''}, ${child.fundingType}, ${JSON.stringify(child.schedule)})
      RETURNING id, name, date_of_birth, funding_type, schedule
    `;
    savedChildren.push(c);
  }

  return NextResponse.json(mapFamily(family, savedChildren), { status: 201 });
}
