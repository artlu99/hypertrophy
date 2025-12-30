<script setup lang="ts">

interface Props {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1000,
  step: 1,
  disabled: false,
});

const emit = defineEmits<{
  'update:value': [value: number];
}>();

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
  <div class="reps-adjuster">
    <div class="reps-adjuster__display">
      <span class="reps-adjuster__value">{{ value }}</span>
      <span class="reps-adjuster__label">Reps</span>
    </div>
    <div class="reps-adjuster__controls">
      <button
        class="reps-adjuster__button reps-adjuster__button--decrement"
        :disabled="disabled || value <= min"
        @click="decrement"
        aria-label="Decrease reps"
      >
        <span class="reps-adjuster__button-icon">−</span>
      </button>
      <button
        class="reps-adjuster__button reps-adjuster__button--increment"
        :disabled="disabled || value >= max"
        @click="increment"
        aria-label="Increase reps"
      >
        <span class="reps-adjuster__button-icon">+</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.reps-adjuster {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.reps-adjuster__display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: 80px;
  justify-content: center;
}

.reps-adjuster__value {
  font-size: var(--font-size-weight);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.reps-adjuster__label {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.reps-adjuster__controls {
  display: flex;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 300px;
}

.reps-adjuster__button {
  flex: 1;
  min-width: 120px;
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

.reps-adjuster__button:not(:disabled):hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.reps-adjuster__button:not(:disabled):active {
  transform: scale(0.95);
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-bg-primary);
}

.reps-adjuster__button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reps-adjuster__button-icon {
  display: block;
  line-height: 1;
}

@media (min-width: 768px) {
  .reps-adjuster__value {
    font-size: var(--font-size-6xl);
  }
  
  .reps-adjuster__button {
    min-height: 72px;
    font-size: var(--font-size-5xl);
  }
}
</style>

