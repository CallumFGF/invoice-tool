'use client';

import { useEffect, useState } from 'react';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FamilyForm } from './family-form';
import type { Family } from '@/lib/types';
import { FUNDING_TYPES, MAX_FAMILIES } from '@/lib/constants';
import { getFamilies, saveFamily, deleteFamily } from '@/lib/storage';

export function FamilyList() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [editTarget, setEditTarget] = useState<Family | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setFamilies(getFamilies());
  }, []);

  function handleSave(family: Family) {
    saveFamily(family);
    setFamilies(getFamilies());
  }

  function handleDelete(id: string) {
    deleteFamily(id);
    setFamilies(getFamilies());
  }

  function openEdit(family: Family) {
    setEditTarget(family);
    setEditOpen(true);
  }

  const atLimit = families.length >= MAX_FAMILIES;

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Families</h1>
          <p className="text-sm text-muted-foreground">
            {families.length} of {MAX_FAMILIES}
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={atLimit}>
              <Plus className="h-4 w-4" />
              Add Family
            </Button>
          </DialogTrigger>
          <FamilyForm
            onSave={handleSave}
            onClose={() => setAddOpen(false)}
          />
        </Dialog>
      </div>

      {atLimit && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Maximum of {MAX_FAMILIES} families reached.
        </p>
      )}

      {/* Family cards */}
      {families.length === 0 ? (
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
                open={editOpen && editTarget?.id === family.id}
                onOpenChange={open => {
                  if (!open) setEditOpen(false);
                }}
              >
                <button
                  className="w-full text-left"
                  onClick={() => openEdit(family)}
                >
                  <Card className="transition-colors hover:bg-accent/50 active:bg-accent">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {family.surname.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">
                          {family.surname} family
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {family.parentName}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {family.children.map(child => (
                            <Badge
                              key={child.id}
                              variant={child.fundingType === 'none' ? 'none' : 'funded'}
                              className="text-xs"
                            >
                              {child.name}
                              {child.fundingType !== 'none' && (
                                <span className="ml-1 opacity-70">
                                  · {FUNDING_TYPES[child.fundingType].fundedHoursPerDay}h funded
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </button>

                {editTarget?.id === family.id && (
                  <FamilyForm
                    initial={editTarget}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setEditOpen(false)}
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
