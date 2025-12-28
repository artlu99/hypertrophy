<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOffline = ref(!navigator.onLine);
const showBanner = ref(false);

function handleOnline() {
  isOffline.value = false;
  // Hide banner after a short delay to show "back online" message
  setTimeout(() => {
    showBanner.value = false;
  }, 2000);
}

function handleOffline() {
  isOffline.value = true;
  showBanner.value = true;
}

onMounted(() => {
  isOffline.value = !navigator.onLine;
  if (isOffline.value) {
    showBanner.value = true;
  }
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<template>
  <Transition name="offline-banner">
    <div v-if="showBanner" class="offline-indicator" :class="{ 'offline-indicator--offline': isOffline }">
      <div class="offline-indicator__content">
        <span class="offline-indicator__icon">
          {{ isOffline ? '📡' : '✓' }}
        </span>
        <span class="offline-indicator__message">
          {{ isOffline ? 'You are offline. App works without internet!' : 'Back online!' }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.offline-indicator--offline {
  background-color: var(--color-warning);
  border-bottom-color: var(--color-warning);
}

.offline-indicator__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  max-width: 600px;
  margin: 0 auto;
}

.offline-indicator__icon {
  font-size: var(--font-size-lg);
}

.offline-indicator__message {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
}

.offline-banner-enter-active,
.offline-banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.offline-banner-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.offline-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (min-width: 768px) {
  .offline-indicator__message {
    font-size: var(--font-size-base);
  }
}
</style>

