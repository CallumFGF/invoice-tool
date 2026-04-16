'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Users, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FamilyForm } from './family-form';
import type { Family } from '@/lib/types';
import { FUNDING_TYPES } from '@/lib/constants';
import { api } from '@/lib/api';
import { scheduleSummary } from '@/lib/billing';

export function FamilyList() {
  const [families, setFamilies]   = useState<Family[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [addOpen, setAddOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<Family | null>(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await api.getFamilies();
      setFamilies(data);
    } catch {
      setError('Failed to load families. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(family: Family) {
    setSaving(true);
    try {
      if (family.id && families.some(f => f.id === family.id)) {
        const updated = await api.updateFamily(family);
        setFamilies(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      } else {
        const { id: _skip, ...rest } = family;
        const created = await api.createFamily(rest);
        setFamilies(prev => [...prev, created]);
      }
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      await api.deleteFamily(id);
      setFamilies(prev => prev.filter(f => f.id !== id));
    } catch {
      setError('Failed to delete. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Families</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {families.length} {families.length === 1 ? 'family' : 'families'}
            </p>
          )}
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Family
            </Button>
          </DialogTrigger>
          <FamilyForm
            onSave={async f => { await handleSave(f); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
            saving={saving}
          />
        </Dialog>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : families.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Users className="h-12 w-12 opacity-30" />
          <div>
            <p className="font-medium">No families yet</p>
            <p className="text-sm">Tap &quot;Add Family&quot; to get started.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {families.map(family => (
            <li key={family.id}>
              <Dialog
                open={editTarget?.id === family.id}
                onOpenChange={open => { if (!open) setEditTarget(null); }}
              >
                <button className="w-full text-left" onClick={() => setEditTarget(family)}>
                  <Card className="transition-colors hover:bg-accent/50 active:bg-accent">
                    <CardContent className="flex items-center gap-3 p-4">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {family.surname.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{family.surname} family</p>
                        <p className="text-sm text-muted-foreground truncate">{family.parentName}</p>

                        {/* Children chips */}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {family.children.map(child => (
                            <Badge key={child.id} variant={child.fundingType === 'none' ? 'none' : 'funded'} className="text-xs">
                              {child.name}
                              {child.fundingType !== 'none' && (
                                <span className="ml-1 opacity-60">
                                  · {FUNDING_TYPES[child.fundingType].fundedHoursPerDay}h KCC
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>

                        {/* Schedule summary for each child */}
                        {family.children.map(child => (
                          <p key={child.id} className="mt-1 text-xs text-muted-foreground truncate">
                            {child.name}: {scheduleSummary(child.schedule)}
                          </p>
                        ))}
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </button>

                {editTarget?.id === family.id && (
                  <FamilyForm
                    initial={editTarget}
                    onSave={async f => { await handleSave(f); setEditTarget(null); }}
                    onDelete={async id => { await handleDelete(id); setEditTarget(null); }}
                    onClose={() => setEditTarget(null)}
                    saving={saving}
                  />
                )}
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
