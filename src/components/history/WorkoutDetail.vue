<script setup lang="ts">
import { computed } from 'vue';
import type { WorkoutSession, Exercise } from '../../types/workout';
import { getExerciseById } from '../../config/exercises';

interface Props {
  workout: WorkoutSession;
  exercises: Exercise[];
  unit: 'kg' | 'lbs';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'close': [];
}>();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getExerciseName(exerciseId: number): string {
  const exercise = getExerciseById(props.exercises, exerciseId);
  return exercise?.name || `Exercise ${exerciseId}`;
}

function getTotalVolume(exercise: WorkoutSession['exercises'][0]): number {
  return exercise.sets.reduce((total, set) => {
    return total + set.weight * set.reps;
  }, 0);
}

function getMaxWeight(exercise: WorkoutSession['exercises'][0]): number {
  if (exercise.sets.length === 0) return 0;
  return Math.max(...exercise.sets.map((set) => set.weight));
}

const totalVolume = computed(() => {
  return props.workout.exercises.reduce((total, ex) => {
    return total + getTotalVolume(ex);
  }, 0);
});
</script>

<template>
  <div class="workout-detail">
    <div class="workout-detail__header">
      <h2 class="workout-detail__title">Workout Details</h2>
      <button
        class="workout-detail__close"
        @click="() => emit('close')"
        aria-label="Close"
      >
        ×
      </button>
    </div>

    <div class="workout-detail__info">
      <div class="workout-detail__info-item">
        <span class="workout-detail__info-label">Date</span>
        <span class="workout-detail__info-value">{{ formatDate(workout.date) }}</span>
      </div>
      <div class="workout-detail__info-item">
        <span class="workout-detail__info-label">Week</span>
        <span class="workout-detail__info-value">Week {{ workout.week }} / 12</span>
      </div>
      <div class="workout-detail__info-item">
        <span class="workout-detail__info-label">Day</span>
        <span class="workout-detail__info-value">Workout {{ workout.day }}</span>
      </div>
      <div class="workout-detail__info-item">
        <span class="workout-detail__info-label">Total Volume</span>
        <span class="workout-detail__info-value">
          {{ totalVolume.toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }}
        </span>
      </div>
    </div>

    <div class="workout-detail__exercises">
      <h3 class="workout-detail__exercises-title">Exercises</h3>
      <div
        v-for="completedEx in workout.exercises"
        :key="completedEx.exerciseId"
        class="workout-detail__exercise"
      >
        <div class="workout-detail__exercise-header">
          <h4 class="workout-detail__exercise-name">
            {{ getExerciseName(completedEx.exerciseId) }}
          </h4>
          <div class="workout-detail__exercise-stats">
            <span class="workout-detail__exercise-stat">
              Max: {{ getMaxWeight(completedEx).toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }}
            </span>
            <span class="workout-detail__exercise-stat">
              Volume: {{ getTotalVolume(completedEx).toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }}
            </span>
          </div>
        </div>
        <div class="workout-detail__sets">
          <div
            v-for="(set, index) in completedEx.sets"
            :key="index"
            class="workout-detail__set"
          >
            <span class="workout-detail__set-number">Set {{ index + 1 }}</span>
            <span class="workout-detail__set-weight">
              {{ set.weight.toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }}
            </span>
            <span class="workout-detail__set-reps">× {{ set.reps }} reps</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workout-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.workout-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.workout-detail__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  margin: 0;
}

.workout-detail__close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--font-size-3xl);
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.workout-detail__close:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.1);
}

.workout-detail__close:active {
  transform: scale(0.95);
}

.workout-detail__info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.workout-detail__info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.workout-detail__info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workout-detail__info-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.workout-detail__exercises {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.workout-detail__exercises-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.workout-detail__exercise {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.workout-detail__exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.workout-detail__exercise-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-gold);
  margin: 0;
  text-transform: uppercase;
}

.workout-detail__exercise-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-end;
}

.workout-detail__exercise-stat {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.workout-detail__sets {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.workout-detail__set {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

.workout-detail__set-number {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.workout-detail__set-weight {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.workout-detail__set-reps {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

@media (min-width: 768px) {
  .workout-detail__title {
    font-size: var(--font-size-3xl);
  }
  
  .workout-detail__info {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

