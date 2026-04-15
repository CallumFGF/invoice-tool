import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** Returns true if today is within 14 days of the end of the current month */
export function isWithin2WeeksOfMonthEnd(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthEnd = new Date(year, month + 1, 0); // last day of current month
  const reminderStart = new Date(monthEnd);
  reminderStart.setDate(monthEnd.getDate() - 13); // 14 days inclusive
  return now >= reminderStart;
}

/** Returns a human-readable reminder message */
export function getMonthEndReminderText(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthEnd = new Date(year, month + 1, 0);
  const daysLeft = Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const monthName = monthEnd.toLocaleDateString('en-GB', { month: 'long' });
  if (daysLeft <= 1) return `${monthName} ends tomorrow — time to generate invoices!`;
  return `${daysLeft} days until end of ${monthName} — time to generate invoices.`;
}
