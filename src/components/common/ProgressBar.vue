<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
  size: 'md',
});

const percentage = computed(() => {
  if (props.total === 0) return 0;
  return Math.min(100, Math.max(0, (props.current / props.total) * 100));
});

const progressClass = computed(() => [
  'progress-bar',
  `progress-bar--${props.size}`,
]);
</script>

<template>
  <div :class="progressClass">
    <div class="progress-bar__track">
      <div
        class="progress-bar__fill"
        :style="{ width: `${percentage}%` }"
        :aria-valuenow="current"
        :aria-valuemin="0"
        :aria-valuemax="total"
        role="progressbar"
      />
    </div>
    <div v-if="showLabel" class="progress-bar__label">
      Week
      <span class="progress-bar__current">{{ current }}</span>
      <span class="progress-bar__separator">/</span>
      <span class="progress-bar__total">{{ total }}</span>
    </div>
    
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
}

.progress-bar__label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-bold);
}

.progress-bar__current {
  color: var(--color-gold);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
}

.progress-bar__separator {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.progress-bar__total {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.progress-bar__track {
  width: 100%;
  height: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-gold) 0%,
    var(--color-gold-hover) 100%
  );
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
  box-shadow: 0 0 8px var(--color-gold-light);
}

.progress-bar--sm .progress-bar__track {
  height: 4px;
}

.progress-bar--sm .progress-bar__label {
  font-size: var(--font-size-sm);
}

.progress-bar--sm .progress-bar__current {
  font-size: var(--font-size-base);
}

.progress-bar--sm .progress-bar__separator,
.progress-bar--sm .progress-bar__total {
  font-size: var(--font-size-sm);
}

.progress-bar--lg .progress-bar__track {
  height: 12px;
}

.progress-bar--lg .progress-bar__label {
  font-size: var(--font-size-2xl);
}

.progress-bar--lg .progress-bar__current {
  font-size: var(--font-size-3xl);
}

.progress-bar--lg .progress-bar__separator,
.progress-bar--lg .progress-bar__total {
  font-size: var(--font-size-xl);
}
</style>

