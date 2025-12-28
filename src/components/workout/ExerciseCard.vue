<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type { Exercise } from '../../types/workout';
import WeightAdjuster from '../common/WeightAdjuster.vue';
import RepsAdjuster from '../common/RepsAdjuster.vue';
import ExerciseTimer from '../common/ExerciseTimer.vue';
import SetCounter from './SetCounter.vue';
import RestTimer from '../common/RestTimer.vue';
import BigButton from '../common/BigButton.vue';

interface Props {
  exercise: Exercise;
  targetWeight: number;
  targetReps: number;
  targetSets: number;
  currentSet: number; // 1-based
  currentWeight: number;
  currentReps?: number; // For reps-based exercises
  currentTime?: number; // For time-based exercises (target time in seconds)
  unit: 'kg' | 'lbs';
  showRestTimer?: boolean;
  restDuration?: number; // in seconds
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showRestTimer: false,
  restDuration: 90,
  disabled: false,
  currentReps: 10,
  currentTime: 30,
});

const isExerciseComplete = computed(() => {
  return props.currentSet > props.targetSets;
});

const emit = defineEmits<{
  'weight-change': [weight: number];
  'reps-change': [reps: number];
  'time-change': [time: number];
  'complete-set': [];
  'rest-complete': [];
}>();

const isMainLift = computed(() => {
  // Main lifts: compound movements that require longer rest
  const mainLifts = [
    'Squat',
    'Deadlift',
    'Bench Press',
    'Overhead Press',
    'Dumbbell Goblet Squat',
    'Dumbbell Overhead Press',
    'Dumbbell Romanian Deadlift',
    'Dumbbell Bent-Over Row',
  ];
  return mainLifts.includes(props.exercise.name);
});

const restDurationForExercise = computed(() => {
  // Main lifts: 3 minutes (180s), Accessory: 90 seconds
  return isMainLift.value ? 180 : 90;
});

const trackingType = computed(() => {
  return props.exercise.trackingType || 'weight';
});

const isWeightBased = computed(() => trackingType.value === 'weight');
const isRepsBased = computed(() => trackingType.value === 'reps');
const isTimeBased = computed(() => trackingType.value === 'time');

const displayWeight = computed(() => {
  if (isWeightBased.value) {
    return `${props.targetWeight.toFixed(props.unit === 'kg' ? 1 : 0)} ${props.unit}`;
  }
  return 'Bodyweight';
});

const exerciseTimerRef = ref<InstanceType<typeof ExerciseTimer> | null>(null);

const weightDifference = computed(() => {
  const diff = props.currentWeight - props.targetWeight;
  if (Math.abs(diff) < 0.1) return 0;
  return diff;
});

const weightStatus = computed(() => {
  const diff = weightDifference.value;
  if (diff === 0) return 'target';
  if (diff > 0) return 'above';
  return 'below';
});

const restTimerRef = ref<InstanceType<typeof RestTimer> | null>(null);

// Auto-start rest timer when it becomes visible
watch(
  () => props.showRestTimer,
  async (isVisible) => {
    if (isVisible && restTimerRef.value) {
      await nextTick();
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        restTimerRef.value?.start();
      }, 300);
    }
  }
);
</script>

<template>
  <div class="exercise-card">
    <div class="exercise-card__header">
      <h2 class="exercise-card__name">{{ exercise.name }}</h2>
      <div class="exercise-card__targets">
        <div v-if="isWeightBased" class="exercise-card__target">
          <span class="exercise-card__target-label">Target Weight</span>
          <span class="exercise-card__target-value">{{ displayWeight }}</span>
        </div>
        <div v-if="isTimeBased" class="exercise-card__target">
          <span class="exercise-card__target-label">Target Time</span>
          <span class="exercise-card__target-value">{{ Math.floor((currentTime || 30) / 60) }}:{{ ((currentTime || 30) % 60).toString().padStart(2, '0') }}</span>
        </div>
        <div class="exercise-card__target">
          <span class="exercise-card__target-label">{{ isTimeBased ? 'Sets' : 'Target Reps' }}</span>
          <span class="exercise-card__target-value">{{ isTimeBased ? targetSets : targetReps }}</span>
        </div>
      </div>
    </div>

    <SetCounter :current-set="currentSet" :total-sets="targetSets" />

    <!-- Weight-based exercises -->
    <div v-if="isWeightBased" class="exercise-card__weight-section">
      <div class="exercise-card__current-weight">
        <span class="exercise-card__current-label">Current Weight</span>
        <WeightAdjuster
          :value="currentWeight"
          :unit="unit"
          :min="0"
          :max="1000"
          :step="unit === 'kg' ? 2.5 : 5"
          @update:value="(weight) => emit('weight-change', weight)"
        />
        <div v-if="weightDifference !== 0" class="exercise-card__weight-diff" :class="`exercise-card__weight-diff--${weightStatus}`">
          <span v-if="weightStatus === 'above'">+{{ Math.abs(weightDifference).toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }} above target</span>
          <span v-else>{{ Math.abs(weightDifference).toFixed(unit === 'kg' ? 1 : 0) }} {{ unit }} below target</span>
        </div>
      </div>
    </div>

    <!-- Reps-based exercises (Push-Ups) -->
    <div v-else-if="isRepsBased" class="exercise-card__reps-section">
      <div class="exercise-card__current-reps">
        <span class="exercise-card__current-label">Reps Completed</span>
        <RepsAdjuster
          :value="currentReps"
          :min="0"
          :max="200"
          :step="1"
          @update:value="(reps) => emit('reps-change', reps)"
        />
        <p class="exercise-card__reps-hint">Do as many reps as possible (to failure)</p>
      </div>
    </div>

    <!-- Time-based exercises (Plank) -->
    <div v-else-if="isTimeBased" class="exercise-card__time-section">
      <ExerciseTimer
        ref="exerciseTimerRef"
        :duration="currentTime || 30"
        :auto-start="false"
        :show-controls="true"
        @complete="() => emit('complete-set')"
        @time-change="(time) => emit('time-change', time)"
      />
    </div>

    <div v-if="showRestTimer" class="exercise-card__rest">
      <RestTimer
        ref="restTimerRef"
        :duration="restDurationForExercise"
        :auto-start="false"
        @complete="() => emit('rest-complete')"
      />
    </div>

    <div class="exercise-card__actions">
      <BigButton
        v-if="!isExerciseComplete"
        label="COMPLETE SET"
        variant="success"
        size="lg"
        full-width
        :disabled="disabled"
        :aria-label="`Complete set ${props.currentSet} of ${props.targetSets} for ${exercise.name}`"
        @click="() => emit('complete-set')"
      />
      <div v-else class="exercise-card__complete">
        <p class="exercise-card__complete-message">Exercise Complete! ✓</p>
        <p class="exercise-card__complete-hint">Move to next exercise or finish workout</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.exercise-card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.exercise-card__name {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-accent);
  text-align: center;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-tight);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.exercise-card__targets {
  display: flex;
  gap: var(--spacing-xl);
  width: 100%;
  justify-content: center;
}

.exercise-card__target {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.exercise-card__target-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exercise-card__target-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.exercise-card__weight-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.exercise-card__current-weight {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.exercise-card__current-label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exercise-card__weight-diff {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
}

.exercise-card__weight-diff--above {
  color: var(--color-success);
  background-color: rgba(34, 197, 94, 0.1);
}

.exercise-card__weight-diff--below {
  color: var(--color-warning);
  background-color: rgba(251, 191, 36, 0.1);
}

.exercise-card__bodyweight-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.exercise-card__bodyweight-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.exercise-card__bodyweight-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  font-style: italic;
}

.exercise-card__reps-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.exercise-card__current-reps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.exercise-card__reps-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  font-style: italic;
}

.exercise-card__time-section {
  width: 100%;
}

.exercise-card__rest {
  width: 100%;
}

.exercise-card__actions {
  width: 100%;
  padding-top: var(--spacing-md);
}

.exercise-card__complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--color-success);
  border-radius: var(--radius-lg);
  opacity: 0.9;
}

.exercise-card__complete-message {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.exercise-card__complete-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

@media (min-width: 768px) {
  .exercise-card__name {
    font-size: var(--font-size-4xl);
  }
  
  .exercise-card__target-value {
    font-size: var(--font-size-3xl);
  }
}
</style>

