<script setup lang="ts">
import { computed } from 'vue';
import type { AppError } from '../../composables/useErrorHandler';
import { useErrorHandler } from '../../composables/useErrorHandler';

const { errors, removeError } = useErrorHandler();

const visibleErrors = computed(() => errors.value);
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="error-toast" tag="div" class="error-toast-container">
      <div
        v-for="error in visibleErrors"
        :key="error.timestamp"
        class="error-toast"
        role="alert"
        aria-live="assertive"
      >
        <div class="error-toast__content">
          <span class="error-toast__icon">⚠️</span>
          <span class="error-toast__message">{{ error.message }}</span>
          <button
            class="error-toast__close"
            @click="removeError(error)"
            aria-label="Dismiss error"
            type="button"
          >
            ×
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.error-toast-container {
  position: fixed;
  top: 80px;
  right: var(--spacing-md);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 400px;
  pointer-events: none;
}

.error-toast {
  pointer-events: auto;
  padding: var(--spacing-md);
  background-color: var(--color-error);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-toast__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.error-toast__icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.error-toast__message {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

.error-toast__close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  line-height: 1;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.error-toast__close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.error-toast-enter-active,
.error-toast-leave-active {
  transition: all 0.3s ease;
}

.error-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.error-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (min-width: 768px) {
  .error-toast-container {
    top: var(--spacing-lg);
    right: var(--spacing-lg);
  }
}
</style>

