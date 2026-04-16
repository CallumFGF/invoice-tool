'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Provider } from '@/lib/types';
import { APP_VERSION, MONTH_NAMES } from '@/lib/constants';
import { api } from '@/lib/api';
import { UserMenu } from '@/components/auth/user-menu';

const DEFAULT: Provider = {
  name: '', businessName: '', address: '', email: '', phone: '', ofstedNumber: '',
  hourlyRate: 7.0, bankAccountName: '', sortCode: '', accountNumber: '',
  paymentReferenceFormat: '{SURNAME}-{MON}{YEAR}',
};

export function SettingsForm() {
  const [form, setForm] = useState<Provider>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.getProvider().then(p => setForm(p)).finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Provider>(key: K, value: Provider[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.saveProvider(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore — could show a toast
    } finally {
      setSaving(false);
    }
  }

  const now = new Date();
  const refPreview = (form.paymentReferenceFormat || '{SURNAME}-{MON}{YEAR}')
    .replace('{SURNAME}', 'SMITH')
    .replace('{MON}', MONTH_NAMES[now.getMonth()].slice(0, 3).toUpperCase())
    .replace('{YEAR}', String(now.getFullYear()));

  return (
    <div className="space-y-4 p-4 pb-8">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* ── Signed-in user ── */}
      <UserMenu />

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* ── Provider identity ── */}
          <Card>
            <CardHeader><CardTitle className="text-base">Your Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Field label="Your Name" htmlFor="name">
                <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" />
              </Field>
              <Field label="Business / Trading Name" htmlFor="businessName">
                <Input id="businessName" value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Happy Days Childminding" />
              </Field>
              <Field label="Business Address" htmlFor="address">
                <Textarea id="address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="1 Oak Lane, Maidstone, ME1 1AA" rows={2} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" htmlFor="email">
                  <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
                </Field>
                <Field label="Phone" htmlFor="phone">
                  <Input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="07700 900000" />
                </Field>
              </div>
              <Field label="Ofsted Registration Number" htmlFor="ofsted">
                <Input id="ofsted" value={form.ofstedNumber} onChange={e => set('ofstedNumber', e.target.value)} placeholder="EY123456" />
              </Field>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader><CardTitle className="text-base">Hourly Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">£</span>
                <Input
                  type="number"
                  min={0}
                  step={0.25}
                  value={form.hourlyRate}
                  onChange={e => set('hourlyRate', parseFloat(e.target.value) || 7)}
                  className="max-w-[120px]"
                />
                <span className="text-sm text-muted-foreground">per hour</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Applies to both funded and private hours.</p>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Field label="Account Name" htmlFor="bankName">
                <Input id="bankName" value={form.bankAccountName} onChange={e => set('bankAccountName', e.target.value)} placeholder="Jane Doe" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort Code" htmlFor="sortCode">
                  <Input id="sortCode" value={form.sortCode} onChange={e => set('sortCode', e.target.value)} placeholder="01-23-45" maxLength={8} />
                </Field>
                <Field label="Account Number" htmlFor="accountNo">
                  <Input id="accountNo" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="12345678" maxLength={8} />
                </Field>
              </div>
              <Field label="Payment Reference Format" htmlFor="refFormat">
                <Input id="refFormat" value={form.paymentReferenceFormat} onChange={e => set('paymentReferenceFormat', e.target.value)} placeholder="{SURNAME}-{MON}{YEAR}" />
                <p className="text-xs text-muted-foreground mt-1">
                  Placeholders: <code className="bg-muted px-1 rounded">{'{SURNAME}'}</code>{' '}
                  <code className="bg-muted px-1 rounded">{'{MON}'}</code>{' '}
                  <code className="bg-muted px-1 rounded">{'{YEAR}'}</code> · Preview: <strong>{refPreview}</strong>
                </p>
              </Field>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full" size="lg" disabled={saving}>
            {saved ? (
              <><CheckCircle2 className="h-5 w-5" /> Saved!</>
            ) : saving ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Saving…</>
            ) : (
              <><Save className="h-5 w-5" /> Save Settings</>
            )}
          </Button>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground pt-2">
        Childminder Invoice v{APP_VERSION}
      </p>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
