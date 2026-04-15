'use client';

import { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
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
import { calculateChildLine } from '@/lib/billing';
import { getFamilies, getProvider } from '@/lib/storage';
import { generateId, formatCurrency } from '@/lib/utils';

interface ChildInputs {
  absentDays: number;
  closureDaysFunded: number;
  closureDaysPrivate: number;
}

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export function InvoiceBuilder() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [childInputs, setChildInputs] = useState<Record<string, ChildInputs>>({});
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const all = getFamilies();
    setFamilies(all);
    if (all.length > 0) setSelectedFamilyId(all[0].id);
  }, []);

  const selectedFamily = families.find(f => f.id === selectedFamilyId);

  function getInputs(childId: string): ChildInputs {
    return childInputs[childId] ?? { absentDays: 0, closureDaysFunded: 0, closureDaysPrivate: 0 };
  }

  function setInput(childId: string, key: keyof ChildInputs, value: number) {
    setChildInputs(prev => ({
      ...prev,
      [childId]: { ...getInputs(childId), [key]: Math.max(0, value) },
    }));
    setInvoice(null);
  }

  function generateInvoice() {
    if (!selectedFamily) return;
    const provider = getProvider();

    const perChild: InvoiceChildLine[] = selectedFamily.children.map(child => {
      const inputs = getInputs(child.id);
      const fundedHoursPerDay = FUNDING_TYPES[child.fundingType].fundedHoursPerDay;
      return calculateChildLine(
        child,
        year,
        month,
        inputs.absentDays,
        inputs.closureDaysFunded,
        inputs.closureDaysPrivate,
        provider.hourlyRate,
      );
    });

    const grandTotal = perChild.reduce((sum, l) => sum + l.privateTotal, 0);
    const totalFundedValue = perChild.reduce((sum, l) => sum + l.fundedValue, 0);

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
      grandTotal,
      totalFundedValue,
      provider,
    });
  }

  function resetForm() {
    setInvoice(null);
    setChildInputs({});
  }

  if (families.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground p-4">
        <FileText className="h-12 w-12 opacity-30" />
        <div>
          <p className="font-medium">No families saved</p>
          <p className="text-sm">Add a family first before creating an invoice.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Invoice</h1>

      {!invoice ? (
        <>
          {/* ── Step 1: select family + period ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Family</Label>
                <Select value={selectedFamilyId} onValueChange={v => { setSelectedFamilyId(v); setChildInputs({}); }}>
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
                  <Select
                    value={String(month)}
                    onValueChange={v => { setMonth(Number(v)); setInvoice(null); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((name, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Select
                    value={String(year)}
                    onValueChange={v => { setYear(Number(v)); setInvoice(null); }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Step 2: per-child adjustments ── */}
          {selectedFamily?.children.map(child => {
            const inputs = getInputs(child.id);
            const fundingInfo = FUNDING_TYPES[child.fundingType];
            const provider = getProvider();
            const preview = calculateChildLine(
              child,
              year,
              month,
              inputs.absentDays,
              inputs.closureDaysFunded,
              inputs.closureDaysPrivate,
              provider.hourlyRate,
            );

            return (
              <Card key={child.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">{child.name}</CardTitle>
                    <Badge variant={child.fundingType === 'none' ? 'none' : 'funded'}>
                      {fundingInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {child.contractDaysPerWeek}d/wk · {child.hoursPerDay}h/day ·{' '}
                    <strong>{preview.contractDays} contract days</strong> in{' '}
                    {MONTH_NAMES[month - 1]} {year}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Absent days</Label>
                      <Input
                        type="number"
                        min={0}
                        max={preview.contractDays}
                        value={inputs.absentDays}
                        onChange={e => setInput(child.id, 'absentDays', parseInt(e.target.value) || 0)}
                        className="h-10 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs leading-tight">Closure (funded)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={preview.contractDays}
                        value={inputs.closureDaysFunded}
                        onChange={e => setInput(child.id, 'closureDaysFunded', parseInt(e.target.value) || 0)}
                        className="h-10 text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs leading-tight">Closure (private)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={preview.contractDays}
                        value={inputs.closureDaysPrivate}
                        onChange={e => setInput(child.id, 'closureDaysPrivate', parseInt(e.target.value) || 0)}
                        className="h-10 text-center"
                      />
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
                    {preview.fundedHours > 0 && (
                      <div className="flex justify-between text-green-700 dark:text-green-400">
                        <span>Funded ({preview.fundedHours}h, KCC)</span>
                        <span>{formatCurrency(preview.fundedValue)}</span>
                      </div>
                    )}
                    {preview.privateHours > 0 && (
                      <div className="flex justify-between">
                        <span>Private ({preview.privateHours}h)</span>
                        <span className="font-medium">{formatCurrency(preview.privateTotal)}</span>
                      </div>
                    )}
                    {preview.fundedHours === 0 && preview.privateHours === 0 && (
                      <p className="text-muted-foreground italic">£0 this month</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button onClick={generateInvoice} className="w-full" size="lg" disabled={!selectedFamily}>
            <FileText className="h-5 w-5" />
            Generate Invoice
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" onClick={resetForm} className="no-print gap-2">
            <RefreshCw className="h-4 w-4" />
            New Invoice
          </Button>
          <InvoicePreview invoice={invoice} />
        </>
      )}
    </div>
  );
}
