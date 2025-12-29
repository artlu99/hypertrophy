<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BigButton from './BigButton.vue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const showPrompt = ref(false);
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
const isIOS = ref(false);

// Detect iOS
function detectIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function handleBeforeInstallPrompt(e: Event) {
  // Prevent the mini-infobar from appearing
  e.preventDefault();
  // Store the event for later use
  deferredPrompt.value = e as BeforeInstallPromptEvent;
  showPrompt.value = true;
}

async function handleInstallClick() {
  if (isIOS.value) {
    // For iOS, we just dismiss since user needs to follow manual instructions
    handleDismiss();
    return;
  }

  if (!deferredPrompt.value) return;

  // Show the install prompt
  deferredPrompt.value.prompt();

  // Wait for the user to respond
  const { outcome } = await deferredPrompt.value.userChoice;

  if (outcome === 'accepted') {
    showPrompt.value = false;
    isInstalled.value = true;
  }

  // Clear the deferred prompt
  deferredPrompt.value = null;
}

function handleDismiss() {
  showPrompt.value = false;
  // Store dismissal in localStorage to avoid showing again for a while
  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
}

onMounted(() => {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled.value = true;
    return;
  }

  // Check if user recently dismissed
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    // Don't show again for 7 days
    if (daysSinceDismissed < 7) {
      return;
    }
  }

  // Detect iOS
  isIOS.value = detectIOS();

  // For iOS, show prompt after a short delay
  if (isIOS.value) {
    // Show iOS prompt after 3 seconds
    setTimeout(() => {
      showPrompt.value = true;
    }, 3000);
  } else {
    // Listen for the beforeinstallprompt event (Android/Chrome)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }

  // Check if app is already installed
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true;
    showPrompt.value = false;
    deferredPrompt.value = null;
  });
});
</script>

<template>
  <Transition name="install-prompt">
    <div v-if="showPrompt && !isInstalled" class="install-prompt">
      <div class="install-prompt__content">
        <div class="install-prompt__header">
          <h3 class="install-prompt__title">Install Hypertrophy</h3>
          <button
            class="install-prompt__close"
            @click="handleDismiss"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
        <p class="install-prompt__message">
          <template v-if="isIOS">
            Install Hypertrophy on your Home Screen for a better experience:
            <ol class="install-prompt__ios-steps">
              <li>Tap the <strong>Share</strong> button <span class="install-prompt__ios-icon">□↑</span> at the bottom</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> to confirm</li>
            </ol>
          </template>
          <template v-else>
            Install Hypertrophy on your device for a better experience. Works offline and loads faster!
          </template>
        </p>
        <div class="install-prompt__actions">
          <BigButton
            :label="isIOS ? 'Got it' : 'Install'"
            variant="primary"
            size="md"
            full-width
            @click="handleInstallClick"
          />
          <button
            class="install-prompt__dismiss"
            @click="handleDismiss"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border-top: 2px solid var(--color-accent);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
}

.install-prompt__content {
  max-width: 600px;
  margin: 0 auto;
}

.install-prompt__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.install-prompt__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.install-prompt__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.install-prompt__close:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.1);
}

.install-prompt__close:active {
  transform: scale(0.95);
}

.install-prompt__message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: var(--line-height-relaxed);
}

.install-prompt__ios-steps {
  margin: var(--spacing-md) 0 0 0;
  padding-left: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.install-prompt__ios-steps li {
  line-height: var(--line-height-relaxed);
}

.install-prompt__ios-icon {
  display: inline-block;
  padding: 2px 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: var(--font-size-sm);
  margin: 0 2px;
}

.install-prompt__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.install-prompt__dismiss {
  padding: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.install-prompt__dismiss:hover {
  color: var(--color-text-primary);
}

.install-prompt-enter-active,
.install-prompt-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.install-prompt-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.install-prompt-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (min-width: 768px) {
  .install-prompt {
    padding: var(--spacing-lg);
  }
  
  .install-prompt__title {
    font-size: var(--font-size-xl);
  }
}
</style>

