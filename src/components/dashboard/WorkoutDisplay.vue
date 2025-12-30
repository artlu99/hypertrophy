<script setup lang="ts">
import { computed } from 'vue';
import { useWorkoutStore } from '../../stores/workout';

const workoutStore = useWorkoutStore();

const dayDisplay = computed(() => {
  const dayNames: Record<'A' | 'B' | 'C', string> = {
    A: 'Workout A',
    B: 'Workout B',
    C: 'Workout C',
  };
  const dayName = dayNames[workoutStore.currentDay];
  return `Day ${workoutStore.currentDay} - ${dayName}`;
});
</script>

<template>
  <div class="week-day-display">
    <div class="week-day-display__day">{{ dayDisplay }}</div>
  </div>
</template>

<style scoped>
.week-day-display {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 0;
  text-align: left;
}

.week-day-display__week {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  color: var(--color-gold);
  text-shadow: 0 2px 8px var(--color-gold-light);
  letter-spacing: var(--letter-spacing-tight);
}

.week-day-display__day {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: var(--line-height-tight);
}

@media (min-width: 768px) {
  .week-day-display__week {
    font-size: var(--font-size-4xl);
  }
  
  .week-day-display__day {
    font-size: var(--font-size-base);
  }
}
</style>

