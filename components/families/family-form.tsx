'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type {
  Family,
  Child,
  FundingType,
  Schedule,
  SimpleSchedule,
  AdvancedSchedule,
  AdvancedDayConfig,
} from '@/lib/types';
import { FUNDING_TYPES, DAY_LABELS, DEFAULT_SIMPLE_SCHEDULE } from '@/lib/constants';
import { generateId, cn } from '@/lib/utils';

// ── Schedule helpers ──────────────────────────────────────────────────────────

function toAdvanced(s: Schedule): AdvancedSchedule {
  if (s.mode === 'advanced') return s;
  return {
    mode: 'advanced',
    days: s.days.map(enabled => ({
      enabled,
      startTime: s.startTime,
      endTime: s.endTime,
    })) as AdvancedSchedule['days'],
  };
}

function toSimple(s: Schedule): SimpleSchedule {
  if (s.mode === 'simple') return s;
  // Preserve which days are enabled; use first enabled day's times
  const first = s.days.find(d => d.enabled);
  return {
    mode: 'simple',
    days: s.days.map(d => d.enabled) as SimpleSchedule['days'],
    startTime: first?.startTime ?? '08:00',
    endTime: first?.endTime ?? '18:00',
  };
}

function hoursFromTimes(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em - sh * 60 - sm) / 60;
  if (diff <= 0) return '';
  return `${diff % 1 === 0 ? diff : diff.toFixed(1)}h`;
}

// ── Schedule input component ──────────────────────────────────────────────────

function ScheduleInput({
  schedule,
  onChange,
}: {
  schedule: Schedule;
  onChange: (s: Schedule) => void;
}) {
  const mode = schedule.mode;

  function switchMode(next: 'simple' | 'advanced') {
    if (next === mode) return;
    onChange(next === 'advanced' ? toAdvanced(schedule) : toSimple(schedule));
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="inline-flex rounded-lg border p-0.5 bg-muted text-sm">
        {(['simple', 'advanced'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              'px-4 py-1.5 rounded-md font-medium transition-all capitalize',
              mode === m
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'simple' ? (
        <SimpleSchedulePanel
          schedule={schedule as SimpleSchedule}
          onChange={onChange}
        />
      ) : (
        <AdvancedSchedulePanel
          schedule={schedule as AdvancedSchedule}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function SimpleSchedulePanel({
  schedule,
  onChange,
}: {
  schedule: SimpleSchedule;
  onChange: (s: Schedule) => void;
}) {
  function toggleDay(idx: number) {
    const next = [...schedule.days] as SimpleSchedule['days'];
    next[idx] = !next[idx];
    onChange({ ...schedule, days: next });
  }

  const hours = hoursFromTimes(schedule.startTime, schedule.endTime);

  return (
    <div className="space-y-3">
      {/* Day pills */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Attending days</Label>
        <div className="flex gap-2">
          {DAY_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleDay(i)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                'min-h-[44px]',
                schedule.days[i]
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Time range */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Session times</Label>
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={schedule.startTime}
            onChange={e => onChange({ ...schedule, startTime: e.target.value })}
            className="flex-1"
          />
          <span className="text-muted-foreground shrink-0">to</span>
          <Input
            type="time"
            value={schedule.endTime}
            onChange={e => onChange({ ...schedule, endTime: e.target.value })}
            className="flex-1"
          />
        </div>
        {hours && (
          <p className="text-xs text-muted-foreground">
            = <strong>{hours}</strong> per day
          </p>
        )}
      </div>
    </div>
  );
}

function AdvancedSchedulePanel({
  schedule,
  onChange,
}: {
  schedule: AdvancedSchedule;
  onChange: (s: Schedule) => void;
}) {
  function updateDay(idx: number, patch: Partial<AdvancedDayConfig>) {
    const next = schedule.days.map((d, i) =>
      i === idx ? { ...d, ...patch } : d,
    ) as AdvancedSchedule['days'];
    onChange({ ...schedule, days: next });
  }

  return (
    <div className="space-y-2">
      {DAY_LABELS.map((label, i) => {
        const day = schedule.days[i];
        const hours = day.enabled
          ? hoursFromTimes(day.startTime, day.endTime)
          : null;
        return (
          <div key={label} className="flex items-center gap-3">
            {/* Toggle button for the day */}
            <button
              type="button"
              onClick={() => updateDay(i, { enabled: !day.enabled })}
              className={cn(
                'w-12 shrink-0 rounded-lg py-2 text-xs font-semibold border transition-colors',
                day.enabled
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border',
              )}
            >
              {label}
            </button>

            {day.enabled ? (
              <>
                <Input
                  type="time"
                  value={day.startTime}
                  onChange={e => updateDay(i, { startTime: e.target.value })}
                  className="flex-1 h-10 text-sm"
                />
                <span className="text-muted-foreground text-xs shrink-0">–</span>
                <Input
                  type="time"
                  value={day.endTime}
                  onChange={e => updateDay(i, { endTime: e.target.value })}
                  className="flex-1 h-10 text-sm"
                />
                {hours && (
                  <span className="text-xs text-muted-foreground w-8 shrink-0 text-right">
                    {hours}
                  </span>
                )}
              </>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground italic">Not attending</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Empty child factory ───────────────────────────────────────────────────────

function emptyChild(): Child {
  return {
    id: generateId(),
    name: '',
    dateOfBirth: '',
    fundingType: 'none',
    schedule: { ...DEFAULT_SIMPLE_SCHEDULE, days: [true, false, true, false, true] },
  };
}

// ── Family form ───────────────────────────────────────────────────────────────

interface Props {
  initial?: Family;
  onSave: (family: Family) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  saving?: boolean;
}

export function FamilyForm({ initial, onSave, onDelete, onClose, saving }: Props) {
  const isEdit = Boolean(initial);

  const [surname, setSurname]       = useState(initial?.surname ?? '');
  const [parentName, setParentName] = useState(initial?.parentName ?? '');
  const [address, setAddress]       = useState(initial?.address ?? '');
  const [email, setEmail]           = useState(initial?.email ?? '');
  const [phone, setPhone]           = useState(initial?.phone ?? '');
  const [children, setChildren]     = useState<Child[]>(
    initial?.children?.length ? initial.children : [emptyChild()],
  );

  function updateChild<K extends keyof Child>(idx: number, key: K, value: Child[K]) {
    setChildren(prev => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  }

  function handleSave() {
    if (!surname.trim() || !parentName.trim()) return;
    onSave({
      id: initial?.id ?? generateId(),
      surname: surname.trim(),
      parentName: parentName.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
      children: children.filter(c => c.name.trim()),
    });
  }

  const valid = surname.trim() && parentName.trim() && children.some(c => c.name.trim());

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Family' : 'Add Family'}</DialogTitle>
      </DialogHeader>

      <div className="space-y-5 p-5">
        {/* ── Family details ── */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Family Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="surname">Surname *</Label>
              <Input id="surname" value={surname} onChange={e => setSurname(e.target.value)} placeholder="Smith" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="parentName">Parent / Guardian *</Label>
              <Input id="parentName" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Sarah Smith" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 High Street, Maidstone" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07700 900123" />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Children ── */}
        <section className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Children
          </h3>

          {children.map((child, idx) => (
            <div key={child.id} className="rounded-xl border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Child {idx + 1}</span>
                {children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setChildren(prev => prev.filter((_, i) => i !== idx))}
                    className="text-destructive hover:text-destructive/80 p-1 transition-colors"
                    aria-label="Remove child"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Child's Name *</Label>
                  <Input
                    value={child.name}
                    onChange={e => updateChild(idx, 'name', e.target.value)}
                    placeholder="Lily"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={child.dateOfBirth}
                    onChange={e => updateChild(idx, 'dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Funding Type</Label>
                  <Select
                    value={child.fundingType}
                    onValueChange={v => updateChild(idx, 'fundingType', v as FundingType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FUNDING_TYPES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Schedule</Label>
                <ScheduleInput
                  schedule={child.schedule}
                  onChange={s => updateChild(idx, 'schedule', s)}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setChildren(prev => [...prev, emptyChild()])}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            Add Child
          </Button>
        </section>
      </div>

      <DialogFooter>
        {isEdit && onDelete && (
          <Button
            variant="destructive"
            onClick={() => { onDelete(initial!.id); onClose(); }}
            disabled={saving}
            className="sm:mr-auto"
          >
            Delete Family
          </Button>
        )}
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!valid || saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Family'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
