'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { isWithin2WeeksOfMonthEnd, getMonthEndReminderText } from '@/lib/utils';
import { isNotifDismissed, dismissNotif } from '@/lib/storage';

export function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isWithin2WeeksOfMonthEnd()) return;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (isNotifDismissed(monthKey)) return;

    setMessage(getMonthEndReminderText());
    setShow(true);

    // Request native notification permission and fire once per day
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Childminder Invoice Reminder', {
            body: getMonthEndReminderText(),
            icon: '/icons/icon-192.png',
          });
        }
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      const lastFiredKey = `cm_notif_fired_${monthKey}`;
      const lastFired = localStorage.getItem(lastFiredKey);
      const today = new Date().toDateString();
      if (lastFired !== today) {
        new Notification('Childminder Invoice Reminder', {
          body: getMonthEndReminderText(),
          icon: '/icons/icon-192.png',
        });
        localStorage.setItem(lastFiredKey, today);
      }
    }
  }, []);

  function handleDismiss() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    dismissNotif(monthKey);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground shadow-md">
      <Bell className="h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded p-1 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
