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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  text-align: center;
}

.next-workout-preview__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.next-workout-preview__exercises {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin: var(--spacing-sm) 0;
}

.next-workout-preview__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .next-workout-preview__exercises {
    font-size: var(--font-size-2xl);
  }
}
</style>

