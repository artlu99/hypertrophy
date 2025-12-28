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
  'ghost-button',
  `ghost-button--${props.variant}`,
  `ghost-button--${props.size}`,
  {
    'ghost-button--disabled': props.disabled,
    'ghost-button--full-width': props.fullWidth,
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
  <button
    :class="buttonClass"
    :disabled="disabled"
    :aria-label="label"
    :aria-disabled="disabled"
    @click="handleClick"
    type="button"
  >
    <span class="ghost-button__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.ghost-button {
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

.ghost-button:active:not(.ghost-button--disabled) {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.ghost-button--primary {
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
}

.ghost-button--primary:not(.ghost-button--disabled):active {
  background-color: var(--color-accent-active);
}

@media (hover: hover) {
  .ghost-button--primary:not(.ghost-button--disabled):hover {
    background-color: var(--color-accent-hover);
  }
}

.ghost-button--secondary {
  position: relative;
  background-color: transparent;
  background-image: url('/pawel-bulwan-JWK2H-2qz1Y-unsplash.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  /* Significantly reduce saturation */
  filter: saturate(0.2);
}

.ghost-button--secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 0;
  transition: background-color var(--transition-base);
}

.ghost-button--secondary .ghost-button__label {
  position: relative;
  z-index: 1;
}

.ghost-button--secondary:not(.ghost-button--disabled):active::before {
  background-color: rgba(0, 0, 0, 0.6);
  border-color: var(--color-accent);
}

@media (hover: hover) {
  .ghost-button--secondary:not(.ghost-button--disabled):hover::before {
    background-color: rgba(0, 0, 0, 0.45);
  }
}

.ghost-button--success {
  background-color: var(--color-gold);
  color: var(--color-bg-primary);
  border: 2px solid var(--color-gold);
}

.ghost-button--success:not(.ghost-button--disabled):active {
  background-color: var(--color-gold-hover);
  border-color: var(--color-gold-hover);
  box-shadow: 0 0 12px var(--color-gold-light);
}

@media (hover: hover) {
  .ghost-button--success:not(.ghost-button--disabled):hover {
    background-color: var(--color-gold-hover);
    border-color: var(--color-gold-hover);
    box-shadow: 0 0 12px var(--color-gold-light);
  }
}

.ghost-button--danger {
  background-color: var(--color-error);
  color: var(--color-text-primary);
}

.ghost-button--danger:not(.ghost-button--disabled):active {
  opacity: 0.85;
}

@media (hover: hover) {
  .ghost-button--danger:not(.ghost-button--disabled):hover {
    opacity: 0.9;
  }
}

.ghost-button--sm {
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
}

.ghost-button--md {
  min-height: 52px;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.ghost-button--lg {
  min-height: 64px;
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-xl);
}

.ghost-button--full-width {
  width: 100%;
}

.ghost-button--disabled {
  background-color: var(--color-button-disabled);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.ghost-button__label {
  display: block;
  text-align: center;
}

@media (min-width: 768px) {
  .ghost-button--lg {
    min-height: 72px;
    font-size: var(--font-size-2xl);
  }
}
</style>

