import type { Family, Provider } from './types';
import { DEFAULT_PROVIDER } from './constants';

const FAMILIES_KEY = 'cm_families';
const PROVIDER_KEY = 'cm_provider';
const NOTIF_DISMISSED_KEY = 'cm_notif_dismissed';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ─── Families ────────────────────────────────────────────────────────────────

export function getFamilies(): Family[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(FAMILIES_KEY);
    return raw ? (JSON.parse(raw) as Family[]) : [];
  } catch {
    return [];
  }
}

export function saveFamilies(families: Family[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(FAMILIES_KEY, JSON.stringify(families));
}

export function saveFamily(family: Family): void {
  const families = getFamilies();
  const idx = families.findIndex(f => f.id === family.id);
  if (idx >= 0) {
    families[idx] = family;
  } else {
    families.push(family);
  }
  saveFamilies(families);
}

export function deleteFamily(id: string): void {
  const families = getFamilies().filter(f => f.id !== id);
  saveFamilies(families);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function getProvider(): Provider {
  if (!isBrowser()) return { ...DEFAULT_PROVIDER };
  try {
    const raw = localStorage.getItem(PROVIDER_KEY);
    return raw ? (JSON.parse(raw) as Provider) : { ...DEFAULT_PROVIDER };
  } catch {
    return { ...DEFAULT_PROVIDER };
  }
}

export function saveProvider(provider: Provider): void {
  if (!isBrowser()) return;
  localStorage.setItem(PROVIDER_KEY, JSON.stringify(provider));
}

// ─── Notification dismissal ──────────────────────────────────────────────────

/** Key is "YYYY-MM" to dismiss once per month */
export function isNotifDismissed(monthKey: string): boolean {
  if (!isBrowser()) return true;
  try {
    const raw = localStorage.getItem(NOTIF_DISMISSED_KEY);
    const dismissed: string[] = raw ? JSON.parse(raw) : [];
    return dismissed.includes(monthKey);
  } catch {
    return false;
  }
}

export function dismissNotif(monthKey: string): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(NOTIF_DISMISSED_KEY);
    const dismissed: string[] = raw ? JSON.parse(raw) : [];
    if (!dismissed.includes(monthKey)) {
      dismissed.push(monthKey);
      localStorage.setItem(NOTIF_DISMISSED_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // ignore
  }
}
