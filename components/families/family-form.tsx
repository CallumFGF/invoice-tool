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
import type { Family, Child, FundingType } from '@/lib/types';
import { FUNDING_TYPES } from '@/lib/constants';
import { generateId } from '@/lib/utils';

const DAYS_OPTIONS = [1, 2, 3, 4, 5];

function emptyChild(): Child {
  return {
    id: generateId(),
    name: '',
    dateOfBirth: '',
    fundingType: 'none',
    contractDaysPerWeek: 5,
    hoursPerDay: 10,
  };
}

interface Props {
  initial?: Family;
  onSave: (family: Family) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function FamilyForm({ initial, onSave, onDelete, onClose }: Props) {
  const isEdit = Boolean(initial);

  const [surname, setSurname] = useState(initial?.surname ?? '');
  const [parentName, setParentName] = useState(initial?.parentName ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [children, setChildren] = useState<Child[]>(
    initial?.children?.length ? initial.children : [emptyChild()],
  );

  function updateChild<K extends keyof Child>(idx: number, key: K, value: Child[K]) {
    setChildren(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  }

  function addChild() {
    setChildren(prev => [...prev, emptyChild()]);
  }

  function removeChild(idx: number) {
    setChildren(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!surname.trim() || !parentName.trim()) return;
    const family: Family = {
      id: initial?.id ?? generateId(),
      surname: surname.trim(),
      parentName: parentName.trim(),
      address: address.trim(),
      email: email.trim(),
      phone: phone.trim(),
      children: children.filter(c => c.name.trim()),
    };
    onSave(family);
    onClose();
  }

  function handleDelete() {
    if (initial && onDelete) {
      onDelete(initial.id);
      onClose();
    }
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

          <div className="space-y-1.5">
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={surname}
              onChange={e => setSurname(e.target.value)}
              placeholder="e.g. Smith"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="parentName">Parent / Guardian Name *</Label>
            <Input
              id="parentName"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              placeholder="e.g. Sarah Smith"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 High Street, Maidstone, ME1 1AA"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sarah@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07700 900123"
              />
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
            <div key={child.id} className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Child {idx + 1}</span>
                {children.length > 1 && (
                  <button
                    onClick={() => removeChild(idx)}
                    className="text-destructive hover:text-destructive/80 transition-colors p-1"
                    aria-label="Remove child"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Child's Name *</Label>
                <Input
                  value={child.name}
                  onChange={e => updateChild(idx, 'name', e.target.value)}
                  placeholder="e.g. Lily"
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
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Days / Week</Label>
                  <Select
                    value={String(child.contractDaysPerWeek)}
                    onValueChange={v => updateChild(idx, 'contractDaysPerWeek', Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OPTIONS.map(d => (
                        <SelectItem key={d} value={String(d)}>
                          {d} {d === 1 ? 'day' : 'days'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Hours / Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    step={0.5}
                    value={child.hoursPerDay}
                    onChange={e =>
                      updateChild(idx, 'hoursPerDay', parseFloat(e.target.value) || 10)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addChild} className="w-full">
            <Plus className="h-4 w-4" />
            Add Child
          </Button>
        </section>
      </div>

      <DialogFooter>
        {isEdit && onDelete && (
          <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
            Delete Family
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!valid}>
          {isEdit ? 'Save Changes' : 'Add Family'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
