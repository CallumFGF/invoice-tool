import { auth } from '@/auth';
import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

/** Server component — rendered in app/settings/page.tsx above SettingsForm */
export async function UserMenu() {
  const session = await auth();
  if (!session?.user) return null;

  const { name, email, image } = session.user;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name ?? 'Avatar'}
          className="h-10 w-10 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {(name ?? email ?? '?').slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {name && <p className="font-medium truncate">{name}</p>}
        <p className="text-sm text-muted-foreground truncate">{email}</p>
      </div>

      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
