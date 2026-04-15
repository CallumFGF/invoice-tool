'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Provider } from '@/lib/types';
import { APP_VERSION, MONTH_NAMES } from '@/lib/constants';
import { getProvider, saveProvider } from '@/lib/storage';

export function SettingsForm() {
  const [form, setForm] = useState<Provider>({
    name: '',
    businessName: '',
    address: '',
    email: '',
    phone: '',
    ofstedNumber: '',
    hourlyRate: 7.0,
    bankAccountName: '',
    sortCode: '',
    accountNumber: '',
    paymentReferenceFormat: '{SURNAME}-{MON}{YEAR}',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(getProvider());
  }, []);

  function set<K extends keyof Provider>(key: K, value: Provider[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveProvider(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Generate a preview of the payment reference
  const now = new Date();
  const refPreview = (form.paymentReferenceFormat || '{SURNAME}-{MON}{YEAR}')
    .replace('{SURNAME}', 'SMITH')
    .replace('{MON}', MONTH_NAMES[now.getMonth()].slice(0, 3).toUpperCase())
    .replace('{YEAR}', String(now.getFullYear()));

  return (
    <div className="space-y-4 p-4 pb-8">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* ── Provider identity ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business / Trading Name</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={e => set('businessName', e.target.value)}
              placeholder="Happy Days Childminding"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="1 Oak Lane, Maidstone, ME1 1AA"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="07700 900000"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ofsted">Ofsted Registration Number</Label>
            <Input
              id="ofsted"
              value={form.ofstedNumber}
              onChange={e => set('ofstedNumber', e.target.value)}
              placeholder="EY123456"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Rates ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hourly Rate</CardTitle>
        </CardHeader>
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
          <p className="text-xs text-muted-foreground mt-2">
            Applies to both funded and private hours.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Bank details ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Account Name</Label>
            <Input
              id="bankName"
              value={form.bankAccountName}
              onChange={e => set('bankAccountName', e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sortCode">Sort Code</Label>
              <Input
                id="sortCode"
                value={form.sortCode}
                onChange={e => set('sortCode', e.target.value)}
                placeholder="01-23-45"
                maxLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountNo">Account Number</Label>
              <Input
                id="accountNo"
                value={form.accountNumber}
                onChange={e => set('accountNumber', e.target.value)}
                placeholder="12345678"
                maxLength={8}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="refFormat">Payment Reference Format</Label>
            <Input
              id="refFormat"
              value={form.paymentReferenceFormat}
              onChange={e => set('paymentReferenceFormat', e.target.value)}
              placeholder="{SURNAME}-{MON}{YEAR}"
            />
            <p className="text-xs text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">{'{SURNAME}'}</code>,{' '}
              <code className="bg-muted px-1 rounded">{'{MON}'}</code>,{' '}
              <code className="bg-muted px-1 rounded">{'{YEAR}'}</code> as placeholders.
              Preview: <strong>{refPreview}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} className="w-full" size="lg">
        {saved ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            Saved!
          </>
        ) : (
          <>
            <Save className="h-5 w-5" />
            Save Settings
          </>
        )}
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Childminder Invoice v{APP_VERSION}
      </p>
    </div>
  );
}
