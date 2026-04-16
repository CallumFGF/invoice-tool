import { BANK_HOLIDAYS, FUNDING_TYPES } from './constants';
import type { Child, Schedule, SimpleSchedule, AdvancedSchedule, InvoiceChildLine } from './types';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ── Schedule helpers ──────────────────────────────────────────────────────────

function timeToHours(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

/** Returns 0-indexed weekday indices that the child attends (0 = Mon … 4 = Fri) */
export function scheduledWeekdays(schedule: Schedule): number[] {
  if (schedule.mode === 'simple') {
    return schedule.days.reduce<number[]>((acc, on, i) => (on ? [...acc, i] : acc), []);
  }
  return schedule.days.reduce<number[]>((acc, d, i) => (d.enabled ? [...acc, i] : acc), []);
}

/** Hours on a given weekday index (0 = Mon). Returns 0 if not attending. */
export function hoursOnWeekday(schedule: Schedule, weekdayIdx: number): number {
  if (schedule.mode === 'simple') {
    if (!schedule.days[weekdayIdx]) return 0;
    return Math.max(0, timeToHours(schedule.endTime) - timeToHours(schedule.startTime));
  }
  const d = schedule.days[weekdayIdx];
  if (!d.enabled) return 0;
  return Math.max(0, timeToHours(d.endTime) - timeToHours(d.startTime));
}

/** Weighted average hours across attended days */
export function avgHoursPerDay(schedule: Schedule): number {
  const wds = scheduledWeekdays(schedule);
  if (!wds.length) return 0;
  const total = wds.reduce((s, i) => s + hoursOnWeekday(schedule, i), 0);
  return total / wds.length;
}

/** Short human-readable summary e.g. "Mon Wed Fri · 08:00–18:00" */
export function scheduleSummary(schedule: Schedule): string {
  const wds = scheduledWeekdays(schedule);
  const dayStr = wds.map(i => DAY_NAMES[i]).join(' ');
  if (!dayStr) return 'No days set';

  if (schedule.mode === 'simple') {
    return `${dayStr} · ${schedule.startTime}–${schedule.endTime}`;
  }

  // Advanced — check if all active days have same times
  const activeDays = schedule.days.filter(d => d.enabled);
  const allSame = activeDays.every(
    d => d.startTime === activeDays[0].startTime && d.endTime === activeDays[0].endTime,
  );
  if (allSame && activeDays.length > 0) {
    return `${dayStr} · ${activeDays[0].startTime}–${activeDays[0].endTime}`;
  }

  // Show per-day breakdown
  return wds
    .map(i => {
      const d = (schedule as AdvancedSchedule).days[i];
      return `${DAY_NAMES[i]} ${d.startTime}–${d.endTime}`;
    })
    .join(', ');
}

// ── Contract days ─────────────────────────────────────────────────────────────

function bankHolidaySet(year: number, month: number): Set<string> {
  const set = new Set<string>();
  for (const d of BANK_HOLIDAYS) {
    const [y, m] = d.split('-').map(Number);
    if (y === year && m === month) set.add(d);
  }
  return set;
}

/**
 * Counts the child's contracted working days in a calendar month.
 * Counts only the specific weekdays the child attends, minus bank holidays.
 */
export function calculateContractDays(
  year: number,
  month: number,
  schedule: Schedule,
): number {
  const attending = new Set(scheduledWeekdays(schedule)); // 0-indexed Mon=0
  if (!attending.size) return 0;

  const bankHols = bankHolidaySet(year, month);
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay(); // 0=Sun … 6=Sat
    if (dow === 0 || dow === 6) continue; // skip weekends
    const weekdayIdx = dow - 1; // 0=Mon
    if (!attending.has(weekdayIdx)) continue; // not an attending day
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (!bankHols.has(iso)) count++;
  }

  return count;
}

// ── Invoice line ──────────────────────────────────────────────────────────────

function round2dp(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculates a single child's invoice line.
 *
 * - Absent days:         still charged in full (no deduction)
 * - Closure (funded):   deducted from KCC funded count (and removes the whole day)
 * - Closure (private):  deducted from private charge only
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
  const contractDays = calculateContractDays(year, month, child.schedule);
  const fundedHoursPerDay = FUNDING_TYPES[child.fundingType].fundedHoursPerDay;
  const totalHoursPerDay = avgHoursPerDay(child.schedule);
  const privateHoursPerDay = Math.max(0, totalHoursPerDay - fundedHoursPerDay);

  const effectiveFundedDays = Math.max(0, contractDays - closureDaysFunded);
  const effectivePrivateDays = Math.max(0, contractDays - closureDaysFunded - closureDaysPrivate);

  const fundedHours = round2dp(effectiveFundedDays * fundedHoursPerDay);
  const privateHours = round2dp(effectivePrivateDays * privateHoursPerDay);
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
    scheduleSummary: scheduleSummary(child.schedule),
  };
}
