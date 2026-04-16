import type { FundingType, SimpleSchedule } from './types';

export const KENT_TERM_DATES = [
  { term: 'Autumn 2025', start: '2025-09-01', end: '2025-12-31', weeks: 14 },
  { term: 'Spring 2026', start: '2026-01-01', end: '2026-04-19', weeks: 11 },
  { term: 'Summer 2026', start: '2026-04-20', end: '2026-08-31', weeks: 13 },
];

export const BANK_HOLIDAYS: string[] = [
  '2025-08-25', '2025-12-25', '2025-12-26',
  '2026-01-01', '2026-04-03', '2026-04-06', '2026-05-04', '2026-05-25', '2026-08-31',
  '2027-01-01', '2027-04-02', '2027-04-05', '2027-05-03', '2027-05-31', '2027-08-30',
];

export const FUNDING_TYPES: Record<FundingType, { label: string; fundedHoursPerDay: number }> = {
  '30h_working_parent': { label: '30h Working Parent (3&4yr)', fundedHoursPerDay: 10 },
  '15h_universal':      { label: '15h Universal (3&4yr)',      fundedHoursPerDay: 5  },
  '2yr_working_parent': { label: '2yr Working Parent',         fundedHoursPerDay: 10 },
  '2yr_free_for_two':   { label: '2yr Free for Two',           fundedHoursPerDay: 5  },
  '9months_wpe':        { label: '9 months+ WPE',              fundedHoursPerDay: 10 },
  none:                 { label: 'No Funding',                  fundedHoursPerDay: 0  },
};

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export const DEFAULT_SIMPLE_SCHEDULE: SimpleSchedule = {
  mode: 'simple',
  days: [true, true, true, true, true],
  startTime: '08:00',
  endTime: '18:00',
};

export const DEFAULT_PROVIDER = {
  name: '', businessName: '', address: '', email: '', phone: '',
  ofstedNumber: '', hourlyRate: 7.0, bankAccountName: '', sortCode: '',
  accountNumber: '', paymentReferenceFormat: '{SURNAME}-{MON}{YEAR}',
};

export const APP_VERSION = '2.0.0';
