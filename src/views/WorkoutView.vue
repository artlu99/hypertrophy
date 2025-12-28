<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '../stores/workout';
import AppLayout from '../components/layout/AppLayout.vue';
import ScreenContainer from '../components/layout/ScreenContainer.vue';
import BigButton from '../components/common/BigButton.vue';
import ExerciseCard from '../components/workout/ExerciseCard.vue';

const router = useRouter();
const workoutStore = useWorkoutStore();

const showRestTimer = ref(false);
const wakeLock = ref<WakeLockSentinel | null>(null);

// Keyboard navigation handler
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' && workoutStore.canGoPrevious) {
    e.preventDefault();
    handlePreviousExercise();
  } else if (e.key === 'ArrowRight' && workoutStore.canGoNext) {
    e.preventDefault();
    handleNextExercise();
  }
}

// Initialize workout when component mounts
onMounted(() => {
  if (!workoutStore.isWorkoutActive) {
    try {
      workoutStore.startWorkout();
      if (!workoutStore.isWorkoutActive) {
        // Failed to start workout, redirect to dashboard
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to start workout:', error);
      router.push('/');
    }
  }
  
  // Request wake lock to keep screen on during workout
  if ('wakeLock' in navigator) {
    navigator.wakeLock
      .request('screen')
      .then((lock) => {
        wakeLock.value = lock;
      })
      .catch((error) => {
        // Wake lock request failed, continue anyway
        console.warn('Wake lock request failed:', error);
      });
  }
  
  // Add keyboard navigation support
  window.addEventListener('keydown', handleKeyDown);
});

// Cleanup when component unmounts
onUnmounted(() => {
  // Release wake lock
  if (wakeLock.value) {
    wakeLock.value.release().catch(() => {
      // Ignore errors
    });
  }
  
  // Remove keyboard listener
  window.removeEventListener('keydown', handleKeyDown);
});

const currentExercise = computed(() => workoutStore.getCurrentExercise());
const exerciseProgress = computed(() => workoutStore.getCurrentExerciseProgress());
const targetWeight = computed(() => {
  if (!currentExercise.value) return 0;
  return workoutStore.getTargetWeightForExercise(currentExercise.value.id);
});
const targetReps = computed(() => workoutStore.getTargetRepsForWeek());
const targetSets = computed(() => workoutStore.getTargetSetsForWeek());
const currentWeight = computed(() => {
  if (!currentExercise.value) return 0;
  return currentExercise.value.currentWeight;
});

const currentReps = computed(() => {
  if (!currentExercise.value) return 0;
  return workoutStore.getCurrentReps(currentExercise.value.id);
});

const currentTime = computed(() => {
  if (!currentExercise.value) return 30;
  return workoutStore.getCurrentTime(currentExercise.value.id);
});

const isCurrentExerciseComplete = computed(() => {
  if (!currentExercise.value) return false;
  return workoutStore.isExerciseComplete(currentExercise.value.id);
});

const trackingType = computed(() => {
  if (!currentExercise.value) return 'weight';
  return currentExercise.value.trackingType || 'weight';
});

function handleWeightChange(weight: number) {
  if (!currentExercise.value) return;
  workoutStore.updateActiveWorkoutWeight(currentExercise.value.id, weight);
}

function handleRepsChange(reps: number) {
  if (!currentExercise.value) return;
  workoutStore.updateActiveWorkoutReps(currentExercise.value.id, reps);
}

function handleTimeChange(time: number) {
  if (!currentExercise.value) return;
  workoutStore.updateActiveWorkoutTime(currentExercise.value.id, time);
}

function handleCompleteSet() {
  if (!currentExercise.value || !exerciseProgress.value) return;
  
  const weight = currentWeight.value;
  const reps = trackingType.value === 'reps' ? currentReps.value : targetReps.value;
  const time = trackingType.value === 'time' ? currentTime.value : undefined;
  
  // Store the current set number before completing
  const setJustCompleted = exerciseProgress.value.currentSet;
  
  workoutStore.completeSet(weight, reps, time);
  
  // For time-based exercises, the timer completion triggers this, so don't show rest timer
  if (trackingType.value === 'time') {
    // After time-based exercise completes, check if workout is complete
    const updatedProgress = workoutStore.getCurrentExerciseProgress();
    if (updatedProgress && updatedProgress.currentSet > targetSets.value) {
      // Exercise complete, check if workout is complete
      if (workoutStore.isWorkoutComplete()) {
        handleWorkoutComplete();
      } else {
        workoutStore.nextExercise();
      }
    }
    return;
  }
  
  // After completing, check if there are more sets for this exercise
  // If we just completed set 3 of 3, then currentSet will now be 4
  const updatedProgress = workoutStore.getCurrentExerciseProgress();
  
  if (updatedProgress && updatedProgress.currentSet <= targetSets.value) {
    // More sets remaining, show rest timer
    showRestTimer.value = true;
  } else {
    // Exercise complete (all sets done), check if workout is complete
    if (workoutStore.isWorkoutComplete()) {
      handleWorkoutComplete();
    } else {
      // Move to next exercise
      workoutStore.nextExercise();
      showRestTimer.value = false;
    }
  }
}

function handleRestComplete() {
  showRestTimer.value = false;
  // Rest timer already completed, user can continue
}

function handleNextExercise() {
  workoutStore.nextExercise();
  showRestTimer.value = false;
}

function handlePreviousExercise() {
  workoutStore.previousExercise();
  showRestTimer.value = false;
}

function handleWorkoutComplete() {
  workoutStore.finishWorkout();
  router.push('/');
}

function handleCancelWorkout() {
  if (confirm('Are you sure you want to cancel this workout? Progress will be lost.')) {
    workoutStore.cancelWorkout();
    router.push('/');
  }
}

// Show completion dialog when workout is complete
const isWorkoutComplete = computed(() => workoutStore.isWorkoutComplete());
</script>

<template>
  <AppLayout>
    <ScreenContainer>
      <div v-if="!workoutStore.isWorkoutActive" class="workout-view__empty">
        <p>No active workout. Redirecting...</p>
      </div>

      <div v-else-if="isWorkoutComplete" class="workout-view__complete">
        <div class="workout-view__complete-content">
          <h1 class="workout-view__complete-title">Workout Complete! 🎉</h1>
          <p class="workout-view__complete-message">
            Great job completing all exercises and sets!
          </p>
          <BigButton
            label="Back to Dashboard"
            variant="success"
            size="lg"
            @click="handleWorkoutComplete"
          />
        </div>
      </div>

      <div v-else-if="currentExercise && exerciseProgress" class="workout-view__active">
        <div class="workout-view__header">
          <button
            class="workout-view__nav-button"
            :disabled="!workoutStore.canGoPrevious"
            @click="handlePreviousExercise"
            aria-label="Previous exercise"
            type="button"
          >
            ←
          </button>
          <div class="workout-view__exercise-counter">
            Exercise {{ workoutStore.activeWorkout!.currentExerciseIndex + 1 }} / 
            {{ workoutStore.activeWorkout!.exercises.length }}
          </div>
          <button
            class="workout-view__nav-button"
            :disabled="!workoutStore.canGoNext"
            @click="handleNextExercise"
            aria-label="Next exercise"
            type="button"
          >
            →
          </button>
        </div>

        <Transition name="exercise-card" mode="out-in">
          <ExerciseCard
            :key="currentExercise.id"
            :exercise="currentExercise"
            :target-weight="targetWeight"
            :target-reps="targetReps"
            :target-sets="targetSets"
            :current-set="exerciseProgress.currentSet"
            :current-weight="currentWeight"
            :current-reps="currentReps"
            :current-time="currentTime"
            :unit="workoutStore.unit"
            :show-rest-timer="showRestTimer && !isCurrentExerciseComplete && trackingType !== 'time'"
            :disabled="isCurrentExerciseComplete"
            @weight-change="handleWeightChange"
            @reps-change="handleRepsChange"
            @time-change="handleTimeChange"
            @complete-set="handleCompleteSet"
            @rest-complete="handleRestComplete"
          />
        </Transition>

        <div class="workout-view__footer">
          <BigButton
            label="Cancel Workout"
            variant="danger"
            size="sm"
            @click="handleCancelWorkout"
          />
        </div>
      </div>
    </ScreenContainer>
  </AppLayout>
</template>

<style scoped>
.workout-view__empty,
.workout-view__complete {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.workout-view__complete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  text-align: center;
  max-width: 400px;
}

.workout-view__complete-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-gold);
  margin: 0;
  text-shadow: 0 2px 8px var(--color-gold-light);
  letter-spacing: var(--letter-spacing-tight);
}

.workout-view__complete-message {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.workout-view__active {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.workout-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.workout-view__nav-button {
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.workout-view__nav-button:not(:disabled):hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.workout-view__nav-button:not(:disabled):active {
  transform: scale(0.95);
}

.workout-view__nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.workout-view__exercise-counter {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workout-view__footer {
  display: flex;
  justify-content: center;
  padding-top: var(--spacing-md);
}

.exercise-card-enter-active,
.exercise-card-leave-active {
  transition: all 0.3s ease;
}

.exercise-card-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.exercise-card-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (min-width: 768px) {
  .workout-view__complete-title {
    font-size: var(--font-size-5xl);
  }
  
  .workout-view__nav-button {
    min-width: 56px;
    min-height: 56px;
    font-size: var(--font-size-3xl);
  }
}
</style>

