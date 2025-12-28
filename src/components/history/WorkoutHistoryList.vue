<script setup lang="ts">
import { computed } from 'vue';
import type { WorkoutSession } from '../../types/workout';

interface Props {
  workouts: WorkoutSession[];
  unit: 'kg' | 'lbs';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'workout-selected': [workout: WorkoutSession];
}>();

const sortedWorkouts = computed(() => {
  return [...props.workouts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

function getTotalVolume(workout: WorkoutSession): number {
  return workout.exercises.reduce((total, ex) => {
    const exerciseVolume = ex.sets.reduce((setTotal, set) => {
      return setTotal + set.weight * set.reps;
    }, 0);
    return total + exerciseVolume;
  }, 0);
}

function handleWorkoutClick(workout: WorkoutSession) {
  emit('workout-selected', workout);
}
</script>

<template>
  <div class="workout-history-list">
    <div v-if="sortedWorkouts.length === 0" class="workout-history-list__empty">
      <p class="workout-history-list__empty-text">No workout history yet</p>
      <p class="workout-history-list__empty-hint">Complete your first workout to see it here!</p>
    </div>

    <div v-else class="workout-history-list__items">
      <button
        v-for="workout in sortedWorkouts"
        :key="workout.date"
        class="workout-history-list__item"
        @click="handleWorkoutClick(workout)"
      >
        <div class="workout-history-list__item-header">
          <div class="workout-history-list__item-date">
            {{ formatDate(workout.date) }}
          </div>
          <div class="workout-history-list__item-badge">
            Week {{ workout.week }} - {{ workout.day }}
          </div>
        </div>
        <div class="workout-history-list__item-stats">
          <div class="workout-history-list__stat">
            <span class="workout-history-list__stat-label">Exercises</span>
            <span class="workout-history-list__stat-value">{{ workout.exercises.length }}</span>
          </div>
          <div class="workout-history-list__stat">
            <span class="workout-history-list__stat-label">Total Volume</span>
            <span class="workout-history-list__stat-value">
              {{ getTotalVolume(workout).toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }}
            </span>
          </div>
        </div>
        <div class="workout-history-list__item-arrow">→</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.workout-history-list {
  width: 100%;
}

.workout-history-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  min-height: 300px;
}

.workout-history-list__empty-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.workout-history-list__empty-hint {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.workout-history-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.workout-history-list__item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.workout-history-list__item:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.workout-history-list__item:active {
  transform: translateY(0);
}

.workout-history-list__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.workout-history-list__item-date {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.workout-history-list__item-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workout-history-list__item-stats {
  display: flex;
  gap: var(--spacing-xl);
  flex-wrap: wrap;
}

.workout-history-list__stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.workout-history-list__stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workout-history-list__stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.workout-history-list__item-arrow {
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-2xl);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
}

@media (min-width: 768px) {
  .workout-history-list__item {
    padding: var(--spacing-xl);
  }
  
  .workout-history-list__item-date {
    font-size: var(--font-size-xl);
  }
  
  .workout-history-list__stat-value {
    font-size: var(--font-size-2xl);
  }
}
</style>

