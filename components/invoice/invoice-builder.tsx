'use client';

import { useEffect, useState } from 'react';
import { FileText, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoicePreview } from './invoice-preview';
import type { Family, InvoiceData, InvoiceChildLine } from '@/lib/types';
import { FUNDING_TYPES, MONTH_NAMES } from '@/lib/constants';
import { calculateChildLine, scheduleSummary } from '@/lib/billing';
import { api } from '@/lib/api';
import { generateId, formatCurrency } from '@/lib/utils';

interface ChildInputs {
  absentDays: number;
  closureDaysFunded: number;
  closureDaysPrivate: number;
}

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export function InvoiceBuilder() {
  const [families, setFamilies]       = useState<Family[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [month, setMonth]             = useState(new Date().getMonth() + 1);
  const [year, setYear]               = useState(currentYear);
  const [childInputs, setChildInputs] = useState<Record<string, ChildInputs>>({});
  const [invoice, setInvoice]         = useState<InvoiceData | null>(null);
  const [providerRate, setProviderRate] = useState(7.0);

  useEffect(() => {
    Promise.all([api.getFamilies(), api.getProvider()])
      .then(([fams, prov]) => {
        setFamilies(fams);
        if (fams.length) setSelectedFamilyId(fams[0].id);
        setProviderRate(prov.hourlyRate);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedFamily = families.find(f => f.id === selectedFamilyId);

  function getInputs(childId: string): ChildInputs {
    return childInputs[childId] ?? { absentDays: 0, closureDaysFunded: 0, closureDaysPrivate: 0 };
  }

  function setInput(childId: string, key: keyof ChildInputs, raw: string) {
    const value = Math.max(0, parseInt(raw) || 0);
    setChildInputs(prev => ({ ...prev, [childId]: { ...getInputs(childId), [key]: value } }));
    setInvoice(null);
  }

  async function generateInvoice() {
    if (!selectedFamily) return;
    const provider = await api.getProvider();

    const perChild: InvoiceChildLine[] = selectedFamily.children.map(child => {
      const { absentDays, closureDaysFunded, closureDaysPrivate } = getInputs(child.id);
      return calculateChildLine(child, year, month, absentDays, closureDaysFunded, closureDaysPrivate, provider.hourlyRate);
    });

    setInvoice({
      id: generateId(),
      familyId: selectedFamily.id,
      familySurname: selectedFamily.surname,
      parentName: selectedFamily.parentName,
      familyAddress: selectedFamily.address,
      month,
      year,
      generatedAt: new Date().toISOString(),
      perChild,
      grandTotal: perChild.reduce((s, l) => s + l.privateTotal, 0),
      totalFundedValue: perChild.reduce((s, l) => s + l.fundedValue, 0),
      provider,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!families.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground p-4">
        <FileText className="h-12 w-12 opacity-30" />
        <div>
          <p className="font-medium">No families yet</p>
          <p className="text-sm">Add a family first, then come back to generate invoices.</p>
        </div>
      </div>
    );
  }

  if (invoice) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" size="sm" onClick={() => { setInvoice(null); setChildInputs({}); }} className="no-print gap-2">
          <RefreshCw className="h-4 w-4" />
          New Invoice
        </Button>
        <InvoicePreview invoice={invoice} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Invoice</h1>

      {/* ── Family + period ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invoice details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Family</Label>
            <Select
              value={selectedFamilyId}
              onValueChange={v => { setSelectedFamilyId(v); setChildInputs({}); setInvoice(null); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a family" />
              </SelectTrigger>
              <SelectContent>
                {families.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.surname} family — {f.parentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select value={String(month)} onValueChange={v => { setMonth(Number(v)); setInvoice(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select value={String(year)} onValueChange={v => { setYear(Number(v)); setInvoice(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Per-child adjustments ── */}
      {selectedFamily?.children.map(child => {
        const inputs = getInputs(child.id);
        const preview = calculateChildLine(
          child, year, month,
          inputs.absentDays, inputs.closureDaysFunded, inputs.closureDaysPrivate,
          providerRate,
        );
        const fundingInfo = FUNDING_TYPES[child.fundingType];

        return (
          <Card key={child.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardTitle className="text-base">{child.name}</CardTitle>
                <Badge variant={child.fundingType === 'none' ? 'none' : 'funded'}>
                  {fundingInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {scheduleSummary(child.schedule)}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>{preview.contractDays} contract days</strong> in {MONTH_NAMES[month - 1]} {year}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Inputs row */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['Absent', 'absentDays'],
                    ['Closure (funded)', 'closureDaysFunded'],
                    ['Closure (private)', 'closureDaysPrivate'],
                  ] as const
                ).map(([labelText, key]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs leading-tight">{labelText}</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={preview.contractDays}
                      value={inputs[key] || ''}
                      placeholder="0"
                      onChange={e => setInput(child.id, key, e.target.value)}
                      className="h-11 text-center text-base"
                    />
                  </div>
                ))}
              </div>

              {/* Live preview */}
              <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
                {preview.fundedHours > 0 && (
                  <div className="flex justify-between text-green-700 dark:text-green-400">
                    <span>KCC funded ({preview.fundedHours}h)</span>
                    <span>{formatCurrency(preview.fundedValue)}</span>
                  </div>
                )}
                {preview.privateHours > 0 ? (
                  <div className="flex justify-between font-medium">
                    <span>Parent pays ({preview.privateHours}h)</span>
                    <span>{formatCurrency(preview.privateTotal)}</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    {preview.contractDays === 0 ? 'No contract days this month' : '£0 due from parent'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button
        onClick={generateInvoice}
        className="w-full"
        size="lg"
        disabled={!selectedFamily}
      >
        <FileText className="h-5 w-5" />
        Generate Invoice
      </Button>
    </div>
  );
}
