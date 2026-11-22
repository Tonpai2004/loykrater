'use client';

import { useSyncExternalStore } from 'react';

const CONSENT_STORAGE_KEY = 'loykrater_consent_v1';

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

// Whether this browser has accepted the welcome agreement. The server snapshot says yes,
// so nothing consent-related renders before the client knows better.
export function useConsentAccepted(): boolean {
  return useSyncExternalStore(subscribe, readAccepted, () => true);
}
