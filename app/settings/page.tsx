import { UserMenu } from '@/components/auth/user-menu';
import { SettingsForm } from '@/components/settings/settings-form';

export const metadata = { title: 'Settings — Childminder Invoice' };

export default function SettingsPage() {
  return (
    <>
      <div className="p-4 pb-0">
        <h1 className="text-xl font-bold mb-4">Settings</h1>
        <UserMenu />
      </div>
      <SettingsForm />
    </>
  );
}
