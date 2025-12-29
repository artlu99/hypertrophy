<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import BigButton from '../components/common/BigButton.vue';
import RestTimer from '../components/common/RestTimer.vue';
import AppLayout from '../components/layout/AppLayout.vue';
import ScreenContainer from '../components/layout/ScreenContainer.vue';
import ExerciseCard from '../components/workout/ExerciseCard.vue';
import { useSwipe } from '../composables/useSwipe';
import { useWorkoutStore } from '../stores/workout';

const router = useRouter();
const workoutStore = useWorkoutStore();

const showRestTimer = ref(false);
const wakeLock = ref<WakeLockSentinel | null>(null);
const restTimerRef = ref<InstanceType<typeof RestTimer> | null>(null);

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
  // Check if the current exercise has completed the current set
  return workoutStore.isCurrentSetCompleteForExercise(currentExercise.value.id);
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
  
  // Store current state before completing the set
  const currentExerciseIndex = workoutStore.activeWorkout!.currentExerciseIndex;
  const currentSet = workoutStore.activeWorkout!.currentSet;
  const isLastExercise = currentExerciseIndex === workoutStore.activeWorkout!.exercises.length - 1;
  const isLastSet = currentSet >= targetSets.value;
  
  workoutStore.completeSet(weight, reps, time);
  
  if (isLastExercise && isLastSet) {
    // We just completed the last exercise of the last set - workout is complete
    handleWorkoutComplete();
    return;
  }
  
  if (isLastExercise) {
    // We just completed the last exercise of the current set
    // Show rest timer after completing all exercises in the set
    showRestTimer.value = true;
  } else {
    // Move to next exercise in the same set
    workoutStore.nextExercise();
    showRestTimer.value = false;
  }
}

function handleRestComplete() {
  // User manually clicked to proceed after rest
  showRestTimer.value = false;
  // Move to next set (first exercise)
  workoutStore.nextExercise();
}

async function handleRestBreak() {
  // If rest timer is complete, proceed to next set
  if (restTimerRef.value?.isComplete) {
    handleRestComplete();
    return;
  }
  
  // Otherwise, start the rest timer when user clicks the button
  // Wait for component to be fully mounted if needed
  await nextTick();
  
  // Add a small delay to ensure the component is fully rendered
  setTimeout(() => {
    if (restTimerRef.value) {
      try {
        // Try to start the timer - start() will return early if already running
        restTimerRef.value.start();
      } catch (error) {
        console.error('Error starting rest timer:', error);
      }
    } else {
      console.warn('Rest timer ref not available');
    }
  }, 100);
}

const restDurationForExercise = computed(() => {
  if (!currentExercise.value) return 90;
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
  const isMainLift = mainLifts.includes(currentExercise.value.name);
  // Main lifts: 3 minutes (180s), Accessory: 90 seconds
  return isMainLift ? 180 : 90;
});

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

function getButtonLabel(): string {
  if (!workoutStore.activeWorkout) return 'NEXT EXERCISE';
  
  // If rest timer is showing, check if it's complete
  if (showRestTimer.value) {
    if (restTimerRef.value?.isComplete) {
      // Timer is complete - show "NEXT SET" or "COMPLETE WORKOUT"
      const currentSet = workoutStore.activeWorkout.currentSet;
      const isLastSet = currentSet >= targetSets.value;
      return isLastSet ? 'COMPLETE WORKOUT' : 'NEXT SET';
    }
    // Timer not started or still running - show "REST BREAK"
    return 'REST BREAK';
  }
  
  const currentExerciseIndex = workoutStore.activeWorkout.currentExerciseIndex;
  const currentSet = workoutStore.activeWorkout.currentSet;
  const isLastExercise = currentExerciseIndex === workoutStore.activeWorkout.exercises.length - 1;
  const isLastSet = currentSet >= targetSets.value;
  
  if (isLastExercise && isLastSet) {
    return 'COMPLETE WORKOUT';
  } else if (isLastExercise) {
    return 'REST BREAK';
  } else {
    return 'NEXT EXERCISE';
  }
}

const isRestTimerRunning = computed(() => {
  return showRestTimer.value && restTimerRef.value?.isRunning;
});

// Show completion dialog when workout is complete
const isWorkoutComplete = computed(() => workoutStore.isWorkoutComplete());

// Swipe functionality
const swipeContainer = ref<HTMLElement | null>(null);
useSwipe(swipeContainer, {
  onSwipeLeft: () => {
    if (workoutStore.canGoNext) {
      handleNextExercise();
    }
  },
  onSwipeRight: () => {
    if (workoutStore.canGoPrevious) {
      handlePreviousExercise();
    }
  },
  threshold: 50,
  velocity: 0.3,
});
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

      <div v-else-if="currentExercise && exerciseProgress" ref="swipeContainer" class="workout-view__active">
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
            class="workout-view__cancel-button"
            @click="handleCancelWorkout"
            aria-label="Cancel workout"
            type="button"
            title="Cancel workout"
          >
            ✕
          </button>
        </div>

        <div class="workout-view__card-container">
          <Transition name="exercise-card" mode="out-in">
            <div v-if="showRestTimer" key="rest-timer" class="workout-view__rest-container">
              <RestTimer
                ref="restTimerRef"
                :duration="restDurationForExercise"
                :auto-start="true"
                @complete="handleRestComplete"
              />
            </div>
            <ExerciseCard
              v-else
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
              :disabled="isCurrentExerciseComplete"
              @weight-change="handleWeightChange"
              @reps-change="handleRepsChange"
              @time-change="handleTimeChange"
              @complete-set="handleCompleteSet"
            />
          </Transition>
        </div>

        <div class="workout-view__sticky-footer">
          <BigButton
            v-if="!isWorkoutComplete"
            :label="getButtonLabel()"
            variant="success"
            size="lg"
            full-width
            :disabled="isRestTimerRunning"
            @click="showRestTimer ? handleRestBreak() : handleCompleteSet()"
          />
          <div v-else-if="isWorkoutComplete" class="workout-view__exercise-complete">
            <p class="workout-view__complete-message">Workout Complete! ✓</p>
            <p class="workout-view__complete-hint">Swipe or use arrows to continue</p>
          </div>
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
  gap: var(--spacing-md);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  touch-action: pan-y;
  padding-bottom: 100px; /* Space for sticky footer */
}

.workout-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.workout-view__nav-button {
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
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

.workout-view__cancel-button {
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.workout-view__cancel-button:hover {
  background-color: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-text-primary);
  transform: scale(1.05);
}

.workout-view__cancel-button:active {
  transform: scale(0.95);
}

.workout-view__exercise-counter {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workout-view__card-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workout-view__rest-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  height: 100%;
}

.workout-view__sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
  background-color: var(--color-bg-primary);
  border-top: 2px solid var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  max-width: 100vw;
}

.workout-view__exercise-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background-color: var(--color-success);
  border-radius: var(--radius-lg);
  opacity: 0.9;
}

.workout-view__complete-message {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.workout-view__complete-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
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

  .workout-view__cancel-button {
    min-width: 56px;
    min-height: 56px;
    font-size: var(--font-size-2xl);
  }

  .workout-view__active {
    padding-bottom: 140px; /* More space for larger sticky footer on desktop */
  }
}
</style>

