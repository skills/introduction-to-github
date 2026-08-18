/**
 * Service-worker lifecycle and install-prompt plumbing.
 *
 * Updates are handled gracefully rather than automatically: a new worker
 * installs, waits, and the UI offers a "Reload to update" affordance. That
 * avoids yanking the page out from under someone mid-thought.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'other';

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const isTouchMac = navigator.maxTouchPoints > 1 && /Macintosh/.test(ua);
  if (/iPad|iPhone|iPod/.test(ua) || isTouchMac) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macos';
  return 'other';
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const displayModes = ['standalone', 'minimal-ui', 'window-controls-overlay', 'fullscreen'];
  const matched = displayModes.some((mode) => matchMedia(`(display-mode: ${mode})`).matches);
  // iOS Safari predates the display-mode media query for home-screen apps.
  const iosStandalone = (navigator as { standalone?: boolean }).standalone === true;
  return matched || iosStandalone;
}

/** True on browsers that fire `beforeinstallprompt` (Chromium family). */
export function supportsInstallPrompt(): boolean {
  return typeof window !== 'undefined' && 'onbeforeinstallprompt' in window;
}

export interface ServiceWorkerHandle {
  onUpdateReady: (callback: () => void) => void;
  applyUpdate: () => void;
  dispose: () => void;
}

export function registerServiceWorker(): ServiceWorkerHandle {
  let waitingWorker: ServiceWorker | null = null;
  let updateCallback: (() => void) | null = null;
  let registration: ServiceWorkerRegistration | null = null;
  let refreshing = false;
  let disposed = false;

  const announce = (worker: ServiceWorker) => {
    waitingWorker = worker;
    updateCallback?.();
  };

  const onControllerChange = () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  };

  // VITE_DISABLE_SW covers builds that are served as a single standalone file
  // (an embedded preview, for example) where no separate sw.js exists to fetch.
  const swEnabled = import.meta.env.PROD && import.meta.env.VITE_DISABLE_SW !== '1';
  if ('serviceWorker' in navigator && swEnabled) {
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then((reg) => {
        if (disposed) return;
        registration = reg;
        if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            // `controller` is null on the very first install — that is not an update.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              announce(installing);
            }
          });
        });
        // Catch updates published while a long-lived tab stayed open.
        setInterval(() => void reg.update().catch(() => undefined), 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('Sparkboard: service worker registration failed', error);
      });
  }

  return {
    onUpdateReady(callback) {
      updateCallback = callback;
      if (waitingWorker) callback();
    },
    applyUpdate() {
      const worker = waitingWorker ?? registration?.waiting ?? null;
      if (!worker) {
        window.location.reload();
        return;
      }
      worker.postMessage({ type: 'SKIP_WAITING' });
    },
    dispose() {
      disposed = true;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    },
  };
}
