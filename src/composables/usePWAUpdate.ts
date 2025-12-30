/**
 * PWA Update Detection and Refresh Utility
 * 
 * For iOS Safari PWAs, use location.reload() to update without clearing memory.
 * This preserves localStorage and IndexedDB data.
 */

import { ref, onMounted, onUnmounted } from 'vue';

export interface UpdateInfo {
  available: boolean;
  waiting: boolean;
  registration: ServiceWorkerRegistration | null;
}

const updateInfo = ref<UpdateInfo>({
  available: false,
  waiting: false,
  registration: null,
});

let updateFoundHandler: ((registration: ServiceWorkerRegistration) => void) | null = null;

/**
 * Check if running as a PWA on iOS
 */
export function isIOSPWA(): boolean {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIOS && isStandalone;
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Register service worker update detection
 */
export async function registerUpdateDetection(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    updateInfo.value.registration = registration;

    // Check for updates immediately
    await registration.update();

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          // New service worker is installed and waiting
          if (navigator.serviceWorker.controller) {
            // There's a new version available
            updateInfo.value.available = true;
            updateInfo.value.waiting = true;
            
            if (updateFoundHandler) {
              updateFoundHandler(registration);
            }
          }
        }
      });
    });

    // Listen for controller change (service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Service worker has been updated and activated
      updateInfo.value.available = false;
      updateInfo.value.waiting = false;
    });
  } catch (error) {
    console.error('Failed to register service worker update detection:', error);
  }
}

/**
 * Force check for updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return false;
  }
}

/**
 * Reload the app to apply updates
 * This preserves localStorage and IndexedDB on iOS Safari
 */
export function reloadApp(): void {
  // On iOS Safari PWA, location.reload() preserves localStorage/IndexedDB
  // This is the safe way to update without clearing memory
  window.location.reload();
}

/**
 * Skip waiting and reload (for service worker updates)
 */
export async function skipWaitingAndReload(): Promise<void> {
  if (!updateInfo.value.registration || !updateInfo.value.waiting) {
    reloadApp();
    return;
  }

  try {
    const registration = updateInfo.value.registration;
    const waitingWorker = registration.waiting;
    
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting and activate
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait a moment for the message to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Reload to get the new service worker
    reloadApp();
  } catch (error) {
    console.error('Failed to skip waiting:', error);
    // Fallback to regular reload
    reloadApp();
  }
}

/**
 * Composable for PWA update detection
 */
export function usePWAUpdate() {
  const onUpdateFound = (handler: (registration: ServiceWorkerRegistration) => void) => {
    updateFoundHandler = handler;
  };

  onMounted(() => {
    registerUpdateDetection();
  });

  onUnmounted(() => {
    updateFoundHandler = null;
  });

  return {
    updateInfo,
    isIOSPWA: isIOSPWA(),
    checkForUpdates,
    reloadApp,
    skipWaitingAndReload,
    onUpdateFound,
  };
}

