import { BANK_HOLIDAYS, FUNDING_TYPES } from './constants';
import type { Child, InvoiceChildLine } from './types';

/** Returns ISO date strings (YYYY-MM-DD) of bank holidays in a given month */
function bankHolidaysInMonth(year: number, month: number): Set<string> {
  const set = new Set<string>();
  for (const d of BANK_HOLIDAYS) {
    const [y, m] = d.split('-').map(Number);
    if (y === year && m === month) set.add(d);
  }
  return set;
}

/**
 * Calculates the number of contracted working days in a calendar month.
 * Algorithm: count total weekdays (Mon–Fri) minus bank holidays in the month,
 * then scale by (contractDaysPerWeek / 5), rounded to nearest integer.
 */
export function calculateContractDays(
  year: number,
  month: number,
  contractDaysPerWeek: number,
): number {
  const bankHols = bankHolidaysInMonth(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay(); // 0=Sun … 6=Sat
    if (dow >= 1 && dow <= 5) {
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (!bankHols.has(iso)) workingDays++;
    }
  }

  return Math.round(workingDays * contractDaysPerWeek / 5);
}

/**
 * Calculates a single child's invoice line for a given month.
 *
 * Rules:
 * - Absent days: still charged in full (no deduction).
 * - Closure (funded day): deducted from KCC funded count.
 * - Closure (private day): deducted from private charge to parent.
 * - Both closure types are fully removed from parent billing.
 */
export function calculateChildLine(
  child: Child,
  year: number,
  month: number,
  absentDays: number,
  closureDaysFunded: number,
  closureDaysPrivate: number,
  hourlyRate: number,
): InvoiceChildLine {
  const contractDays = calculateContractDays(year, month, child.contractDaysPerWeek);
  const fundedHoursPerDay = FUNDING_TYPES[child.fundingType].fundedHoursPerDay;
  const privateHoursPerDay = Math.max(0, child.hoursPerDay - fundedHoursPerDay);

  // Days for which KCC funding is claimed
  const effectiveFundedDays = Math.max(0, contractDays - closureDaysFunded);
  // Days for which private hours are charged to parent
  const effectivePrivateDays = Math.max(0, contractDays - closureDaysFunded - closureDaysPrivate);

  const fundedHours = effectiveFundedDays * fundedHoursPerDay;
  const privateHours = effectivePrivateDays * privateHoursPerDay;

  const fundedValue = round2dp(fundedHours * hourlyRate);
  const privateTotal = round2dp(privateHours * hourlyRate);

  return {
    childId: child.id,
    childName: child.name,
    contractDays,
    absentDays,
    closureDaysFunded,
    closureDaysPrivate,
    fundedHours,
    privateHours,
    fundedValue,
    privateTotal,
  };
}

function round2dp(n: number): number {
  return Math.round(n * 100) / 100;
}
