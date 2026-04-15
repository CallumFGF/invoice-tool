'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/families', label: 'Families', icon: Users },
  { href: '/invoice', label: 'Invoice', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'border-t border-border bg-background/95 backdrop-blur-sm',
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors',
                'min-h-[56px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon
                className={cn('h-5 w-5 transition-colors', active && 'stroke-[2.5px]')}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
