'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const CONSENT_STORAGE_KEY = 'loykrater_consent_v1';
const SETTLE_TIMEOUT_MS = 2000;

// Same tiny external-store pattern as LanguageContext: in-memory first so accepting
// still works for this visit when storage is blocked
let memoryAccepted = false;
const listeners = new Set<() => void>();

function readAccepted(): boolean {
  if (memoryAccepted) return true;
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export function acceptConsent() {
  memoryAccepted = true;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((notify) => notify());
}

// True once a first-time visitor should see the welcome agreement. It waits until the page
// has loaded and the main thread is idle, so the home copy paints and settles first.
export function useConsentPending(): boolean {
  // Server snapshot says "accepted" so nothing renders until the client knows better
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (accepted || settled) return;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const reveal = () => setSettled(true);
    const scheduleIdle = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(reveal, { timeout: SETTLE_TIMEOUT_MS });
      } else {
        timerId = setTimeout(reveal, 600);
      }
    };

    if (document.readyState === 'complete') {
      scheduleIdle();
    } else {
      window.addEventListener('load', scheduleIdle, { once: true });
    }

    return () => {
      window.removeEventListener('load', scheduleIdle);
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [accepted, settled]);

  return !accepted && settled;
}
