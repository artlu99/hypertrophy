<script setup lang="ts">
import { computed } from 'vue';
import { useWorkoutStore } from '../../stores/workout';

const workoutStore = useWorkoutStore();

const exercises = computed(() => workoutStore.currentDayExercises);

const exerciseNames = computed(() => {
  return exercises.value.map((ex) => ex.name).join(', ');
});
</script>

<template>
  <div class="next-workout-preview">
    <div class="next-workout-preview__label">Next Workout</div>
    <div class="next-workout-preview__exercises">
      {{ exerciseNames }}
    </div>
    <div class="next-workout-preview__count">
      {{ exercises.length }} {{ exercises.length === 1 ? 'exercise' : 'exercises' }}
    </div>
  </div>
</template>

<style scoped>
.next-workout-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-md);
  background-image: url('/stavros-papadimitriou-60xqDdncSKY-unsplash.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  text-align: center;
  overflow: hidden;
}

.next-workout-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.next-workout-preview__label {
  position: relative;
  z-index: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.next-workout-preview__exercises {
  position: relative;
  z-index: 1;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin: var(--spacing-sm) 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

.next-workout-preview__count {
  position: relative;
  z-index: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .next-workout-preview__exercises {
    font-size: var(--font-size-2xl);
  }
}
</style>

