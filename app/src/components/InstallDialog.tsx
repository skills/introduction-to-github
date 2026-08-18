import { useEffect, useState } from 'react';
import { detectPlatform, isStandalone, supportsInstallPrompt } from '../lib/pwa';
import type { BeforeInstallPromptEvent, Platform } from '../lib/pwa';
import { Button, Dialog } from './primitives';

/** Captured at module scope: the browser fires this once, often before any
 *  component that cares about it has mounted. */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    listeners.forEach((notify) => notify());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((notify) => notify());
  });
}

export function useInstallPrompt() {
  const [available, setAvailable] = useState(() => deferredPrompt !== null);

  useEffect(() => {
    const notify = () => setAvailable(deferredPrompt !== null);
    listeners.add(notify);
    return () => {
      listeners.delete(notify);
    };
  }, []);

  return {
    available,
    async promptInstall() {
      if (!deferredPrompt) return 'unavailable' as const;
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      listeners.forEach((notify) => notify());
      return choice.outcome;
    },
  };
}

const STEPS: Record<Platform, { heading: string; steps: string[]; note?: string }> = {
  ios: {
    heading: 'iPhone or iPad (Safari)',
    steps: [
      'Open Sparkboard in Safari — installing from Chrome or Firefox on iOS is not supported by the system.',
      'Tap the Share button (the square with an arrow).',
      'Scroll down and tap “Add to Home Screen”, then tap “Add”.',
    ],
    note: 'iOS has no install prompt, so this has to be done by hand. Once added, Sparkboard runs full-screen and works offline. Note that iOS may clear website storage if the app goes unused for several weeks — export a backup now and then.',
  },
  android: {
    heading: 'Android (Chrome, Edge, Samsung Internet)',
    steps: [
      'Tap the ⋮ menu in the browser toolbar.',
      'Choose “Install app” or “Add to Home screen”.',
      'Confirm — Sparkboard then launches like any other app.',
    ],
  },
  windows: {
    heading: 'Windows (Chrome or Edge)',
    steps: [
      'Click the install icon at the right-hand end of the address bar.',
      'Alternatively open the ⋮ menu and choose “Install Sparkboard”.',
      'The app gets its own window, taskbar entry and Start menu shortcut.',
    ],
  },
  macos: {
    heading: 'macOS',
    steps: [
      'In Safari, choose File → “Add to Dock”.',
      'In Chrome or Edge, use the install icon in the address bar, or ⋮ → “Install Sparkboard”.',
      'The app then opens in its own window from the Dock or Launchpad.',
    ],
  },
  other: {
    heading: 'Desktop and mobile browsers',
    steps: [
      'Look for an install icon in the address bar, or an “Install app” / “Add to Home screen” entry in the browser menu.',
      'Browsers without PWA installation still run Sparkboard normally in a tab — including offline.',
    ],
  },
};

export function InstallDialog({ onClose }: { onClose: () => void }) {
  const platform = detectPlatform();
  const installed = isStandalone();
  const { available, promptInstall } = useInstallPrompt();
  const guide = STEPS[platform];

  return (
    <Dialog
      title="Install Sparkboard"
      description="Install it and Sparkboard opens in its own window, with no browser chrome, and keeps working with no connection."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          {available ? (
            <Button variant="primary" icon="install" onClick={() => void promptInstall()}>
              Install now
            </Button>
          ) : null}
        </>
      }
    >
      <div className="stack">
        {installed ? (
          <div className="banner">
            <span className="banner__text">
              Sparkboard is already running as an installed app on this device.
            </span>
          </div>
        ) : null}

        <div>
          <h3 className="section__title" style={{ marginBottom: 'var(--sp-3)' }}>
            {guide.heading}
          </h3>
          <ol className="install-steps" style={{ listStyle: 'none', padding: 0 }}>
            {guide.steps.map((step) => (
              <li className="install-step" key={step}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {guide.note ? (
            <p className="privacy-note" style={{ marginTop: 'var(--sp-4)' }}>
              {guide.note}
            </p>
          ) : null}
        </div>

        {!available && supportsInstallPrompt() && !installed ? (
          <p className="text-sm subtle">
            Your browser supports installing, but has not offered the prompt yet — it usually appears
            after you have used the app for a moment. The menu route above always works.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}
