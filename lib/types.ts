export type FundingType =
  | '30h_working_parent'
  | '15h_universal'
  | '2yr_working_parent'
  | '2yr_free_for_two'
  | '9months_wpe'
  | 'none';

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  fundingType: FundingType;
  contractDaysPerWeek: number; // 1–5
  hoursPerDay: number; // default 10
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
  hourlyRate: number; // default 7.00
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
}

export interface InvoiceData {
  id: string;
  familyId: string;
  familySurname: string;
  parentName: string;
  familyAddress: string;
  month: number; // 1–12
  year: number;
  generatedAt: string;
  perChild: InvoiceChildLine[];
  grandTotal: number;
  totalFundedValue: number;
  provider: Provider;
}
