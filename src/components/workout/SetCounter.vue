<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentSet: number; // 1-based
  totalSets: number;
}

const props = defineProps<Props>();

const progress = computed(() => {
  return (props.currentSet / props.totalSets) * 100;
});

const displayText = computed(() => {
  return `Set ${props.currentSet} / ${props.totalSets}`;
});
</script>

<template>
  <div class="set-counter">
    <div class="set-counter__text">{{ displayText }}</div>
    <div class="set-counter__progress">
      <div
        class="set-counter__progress-fill"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.set-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.set-counter__text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.set-counter__progress {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.set-counter__progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

@media (min-width: 768px) {
  .set-counter__text {
    font-size: var(--font-size-2xl);
  }
  
  .set-counter__progress {
    height: 10px;
  }
}
</style>

