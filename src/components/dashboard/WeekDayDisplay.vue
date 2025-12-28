<script setup lang="ts">
import { computed } from 'vue';
import { useWorkoutStore } from '../../stores/workout';

const workoutStore = useWorkoutStore();

const weekDisplay = computed(() => {
  return `Week ${workoutStore.currentWeek} / 12`;
});

const dayDisplay = computed(() => {
  const dayName = workoutStore.currentDay === 'A' ? 'Workout A' : 'Workout B';
  return `Day ${workoutStore.currentDay} - ${dayName}`;
});
</script>

<template>
  <div class="week-day-display">
    <div class="week-day-display__week">{{ weekDisplay }}</div>
    <div class="week-day-display__day">{{ dayDisplay }}</div>
  </div>
</template>

<style scoped>
.week-day-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  text-align: center;
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
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (min-width: 768px) {
  .week-day-display__week {
    font-size: var(--font-size-4xl);
  }
  
  .week-day-display__day {
    font-size: var(--font-size-2xl);
  }
}
</style>

