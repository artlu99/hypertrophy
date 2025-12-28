<script setup lang="ts">
import { computed } from 'vue';
import BigButton from './BigButton.vue';

interface Props {
  value: number;
  unit: 'kg' | 'lbs';
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1000,
  step: 2.5,
  disabled: false,
});

const emit = defineEmits<{
  'update:value': [value: number];
}>();

const displayValue = computed(() => {
  return props.value.toFixed(props.unit === 'kg' ? 1 : 0);
});

function adjust(amount: number) {
  if (props.disabled) return;
  
  const newValue = Math.max(
    props.min,
    Math.min(props.max, props.value + amount)
  );
  
  emit('update:value', newValue);
  
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

function increment() {
  adjust(props.step);
}

function decrement() {
  adjust(-props.step);
}
</script>

<template>
  <div class="weight-adjuster">
    <div class="weight-adjuster__display">
      <span class="weight-adjuster__value">{{ displayValue }}</span>
      <span class="weight-adjuster__unit">{{ unit }}</span>
    </div>
    <div class="weight-adjuster__controls">
      <button
        class="weight-adjuster__button weight-adjuster__button--decrement"
        :disabled="disabled || value <= min"
        @click="decrement"
        aria-label="Decrease weight"
      >
        <span class="weight-adjuster__button-icon">−</span>
      </button>
      <button
        class="weight-adjuster__button weight-adjuster__button--increment"
        :disabled="disabled || value >= max"
        @click="increment"
        aria-label="Increase weight"
      >
        <span class="weight-adjuster__button-icon">+</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.weight-adjuster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.weight-adjuster__display {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  min-height: 80px;
  justify-content: center;
  align-items: center;
}

.weight-adjuster__value {
  font-size: var(--font-size-weight);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.weight-adjuster__unit {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.weight-adjuster__controls {
  display: flex;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 300px;
}

.weight-adjuster__button {
  flex: 1;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-base);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.weight-adjuster__button:not(:disabled):hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.weight-adjuster__button:not(:disabled):active {
  transform: scale(0.95);
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-primary);
}

.weight-adjuster__button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.weight-adjuster__button-icon {
  display: block;
  line-height: 1;
}

@media (min-width: 768px) {
  .weight-adjuster__value {
    font-size: var(--font-size-6xl);
  }
  
  .weight-adjuster__button {
    min-height: 72px;
    font-size: var(--font-size-5xl);
  }
}
</style>

