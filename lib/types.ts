export type FundingType =
  | '30h_working_parent'
  | '15h_universal'
  | '2yr_working_parent'
  | '2yr_free_for_two'
  | '9months_wpe'
  | 'none';

// ── Schedule types ────────────────────────────────────────────────────────────

/** Simple: same hours every attending day. Days = [Mon, Tue, Wed, Thu, Fri]. */
export interface SimpleSchedule {
  mode: 'simple';
  days: [boolean, boolean, boolean, boolean, boolean]; // Mon → Fri
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

/** Advanced: per-day start/end times. */
export interface AdvancedDayConfig {
  enabled: boolean;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface AdvancedSchedule {
  mode: 'advanced';
  days: [
    AdvancedDayConfig,
    AdvancedDayConfig,
    AdvancedDayConfig,
    AdvancedDayConfig,
    AdvancedDayConfig,
  ]; // Mon → Fri
}

export type Schedule = SimpleSchedule | AdvancedSchedule;

// ── Data models ───────────────────────────────────────────────────────────────

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  fundingType: FundingType;
  schedule: Schedule;
}

export interface Family {
  id: string;
  surname: string;
  parentName: string;
  address: string;
  email: string;
  phone: string;
  children: Child[];
}

export interface Provider {
  name: string;
  businessName: string;
  address: string;
  email: string;
  phone: string;
  ofstedNumber: string;
  hourlyRate: number;
  bankAccountName: string;
  sortCode: string;
  accountNumber: string;
  paymentReferenceFormat: string;
}

export interface InvoiceChildLine {
  childId: string;
  childName: string;
  contractDays: number;
  absentDays: number;
  closureDaysFunded: number;
  closureDaysPrivate: number;
  fundedHours: number;
  privateHours: number;
  fundedValue: number;
  privateTotal: number;
  /** Human-readable schedule summary e.g. "Mon Wed Fri, 08:00–18:00" */
  scheduleSummary: string;
}

export interface InvoiceData {
  id: string;
  familyId: string;
  familySurname: string;
  parentName: string;
  familyAddress: string;
  month: number;
  year: number;
  generatedAt: string;
  perChild: InvoiceChildLine[];
  grandTotal: number;
  totalFundedValue: number;
  provider: Provider;
}
