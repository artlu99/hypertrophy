<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'lg',
  disabled: false,
  fullWidth: false,
});

const emit = defineEmits<{
  click: [];
}>();

const buttonClass = computed(() => [
  'big-button',
  `big-button--${props.variant}`,
  `big-button--${props.size}`,
  {
    'big-button--disabled': props.disabled,
    'big-button--full-width': props.fullWidth,
  },
]);

function handleClick() {
  if (!props.disabled) {
    emit('click');
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
}
</script>

<template>
  <button :class="buttonClass" :disabled="disabled" @click="handleClick">
    <span class="big-button__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.big-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 60px;
  padding: var(--spacing-md) var(--spacing-xl);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-tight);
  color: var(--color-button-text);
  background-color: var(--color-button-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.big-button:active:not(.big-button--disabled) {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.big-button--primary {
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
}

.big-button--primary:not(.big-button--disabled):hover {
  background-color: var(--color-accent-hover);
}

.big-button--primary:not(.big-button--disabled):active {
  background-color: var(--color-accent-active);
}

.big-button--secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border-light);
}

.big-button--secondary:not(.big-button--disabled):hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
}

.big-button--success {
  background-color: var(--color-success);
  color: var(--color-text-primary);
}

.big-button--success:not(.big-button--disabled):hover {
  opacity: 0.9;
}

.big-button--danger {
  background-color: var(--color-error);
  color: var(--color-text-primary);
}

.big-button--danger:not(.big-button--disabled):hover {
  opacity: 0.9;
}

.big-button--sm {
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
}

.big-button--md {
  min-height: 52px;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.big-button--lg {
  min-height: 64px;
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-xl);
}

.big-button--full-width {
  width: 100%;
}

.big-button--disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.big-button__label {
  display: block;
  text-align: center;
}

@media (min-width: 768px) {
  .big-button--lg {
    min-height: 72px;
    font-size: var(--font-size-2xl);
  }
}
</style>

