import type { Family, Provider } from './types';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Families
  getFamilies: () => apiFetch<Family[]>('/api/families'),
  createFamily: (f: Omit<Family, 'id'>) =>
    apiFetch<Family>('/api/families', { method: 'POST', body: JSON.stringify(f) }),
  updateFamily: (f: Family) =>
    apiFetch<Family>(`/api/families/${f.id}`, { method: 'PUT', body: JSON.stringify(f) }),
  deleteFamily: (id: string) =>
    apiFetch<void>(`/api/families/${id}`, { method: 'DELETE' }),

  // Provider settings
  getProvider: () => apiFetch<Provider>('/api/provider'),
  saveProvider: (p: Provider) =>
    apiFetch<Provider>('/api/provider', { method: 'PUT', body: JSON.stringify(p) }),
};
