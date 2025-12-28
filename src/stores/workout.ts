/**
 * Pinia store for workout state management
 * Handles all workout data with localStorage persistence
 */

import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import type {
  WorkoutState,
  Exercise,
  WorkoutSession,
  WorkoutDay,
  WeightUnit,
  CompletedExercise,
  CompletedSet,
} from '../types/workout';
import { DEFAULT_EXERCISES } from '../config/exercises';
import { loadState, saveState } from '../utils/storage';
import {
  getTargetWeight,
  getTargetReps,
  getTargetSets,
  shouldAdvanceWeek,
  getNextDay,
} from '../utils/progression';

/**
 * Create initial default state
 */
function createInitialState(): WorkoutState {
  const exercises: Exercise[] = DEFAULT_EXERCISES.map((ex) => ({
    ...ex,
    currentWeight: ex.baseWeight,
  }));

  return {
    user: {
      name: 'Lifter',
      unit: 'kg',
    },
    program: {
      currentWeek: 1,
      currentDay: 'A',
      lastWorkoutDate: null,
      totalWorkoutsCompleted: 0,
    },
    exercises,
    workoutHistory: [],
  };
}

// Active workout state (not persisted, only during active workout)
interface ActiveWorkoutState {
  currentExerciseIndex: number;
  exercises: Exercise[];
  completedExercises: CompletedExercise[];
  startTime: string; // ISO date string
}

export const useWorkoutStore = defineStore('workout', () => {
  // State
  const state = ref<WorkoutState>(createInitialState());

  // Active workout state (temporary, not persisted)
  const activeWorkout = ref<ActiveWorkoutState | null>(null);

  // Initialize from localStorage
  const loaded = loadState();
  if (loaded) {
    state.value = loaded;
  }

  // Computed properties
  const currentWeek = computed(() => state.value.program.currentWeek);
  const currentDay = computed(() => state.value.program.currentDay);
  const exercises = computed(() => state.value.exercises);
  const workoutHistory = computed(() => state.value.workoutHistory);
  const user = computed(() => state.value.user);
  const unit = computed(() => state.value.user.unit);

  // Get exercises for current workout day
  const currentDayExercises = computed(() => {
    return exercises.value.filter(
      (ex) => ex.workoutDay === currentDay.value
    );
  });

  // Get next workout exercises
  const nextDayExercises = computed(() => {
    const nextDay = getNextDay(currentDay.value);
    return exercises.value.filter((ex) => ex.workoutDay === nextDay);
  });

  // Auto-save to localStorage when state changes
  watch(
    state,
    (newState) => {
      saveState(newState);
    },
    { deep: true }
  );

  // Actions
  function updateUser(name: string, unit: WeightUnit) {
    state.value.user.name = name;
    state.value.user.unit = unit;
  }

  function updateExerciseWeight(exerciseId: number, weight: number) {
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      exercise.currentWeight = weight;
    }
  }

  function updateExerciseBaseWeight(exerciseId: number, baseWeight: number) {
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      exercise.baseWeight = baseWeight;
      exercise.currentWeight = baseWeight;
    }
  }

  function completeWorkout(session: WorkoutSession) {
    // Add to history
    state.value.workoutHistory.push(session);

    // Update exercise weights based on completed sets
    session.exercises.forEach((completedEx) => {
      const exercise = state.value.exercises.find(
        (ex) => ex.id === completedEx.exerciseId
      );
      if (exercise && completedEx.sets.length > 0) {
        // Update to the highest weight used in the workout
        const maxWeight = Math.max(
          ...completedEx.sets.map((set) => set.weight)
        );
        exercise.currentWeight = maxWeight;
      }
    });

    // Update program state
    state.value.program.lastWorkoutDate = session.date;
    state.value.program.totalWorkoutsCompleted += 1;

    // Advance week if completing Workout A (all exercises are in Workout A)
    if (shouldAdvanceWeek(currentDay.value, true)) {
      if (state.value.program.currentWeek < 12) {
        state.value.program.currentWeek += 1;
      }
      // Reset to day A for next week
      state.value.program.currentDay = 'A';
    } else {
      // Switch to next day (though Workout B is currently empty)
      state.value.program.currentDay = getNextDay(currentDay.value);
    }
  }

  function resetProgram() {
    state.value = createInitialState();
  }

  function getTargetWeightForExercise(exerciseId: number): number {
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    if (!exercise) {
      return 0;
    }
    return getTargetWeight(
      exercise,
      currentWeek.value,
      state.value.user.unit
    );
  }

  function getTargetRepsForWeek(): number {
    return getTargetReps(currentWeek.value);
  }

  function getTargetSetsForWeek(): number {
    return getTargetSets();
  }

  // Active workout management
  function startWorkout() {
    const exercisesForDay = currentDayExercises.value;
    if (exercisesForDay.length === 0) {
      console.warn('No exercises found for current day');
      return;
    }

    activeWorkout.value = {
      currentExerciseIndex: 0,
      exercises: exercisesForDay,
      completedExercises: exercisesForDay.map((ex) => ({
        exerciseId: ex.id,
        sets: [],
      })),
      startTime: new Date().toISOString(),
    };
  }

  function getCurrentExercise(): Exercise | null {
    if (!activeWorkout.value) return null;
    const exercises = activeWorkout.value.exercises;
    const index = activeWorkout.value.currentExerciseIndex;
    return exercises[index] || null;
  }

  function getCurrentExerciseProgress(): {
    currentSet: number;
    totalSets: number;
    completedSets: CompletedSet[];
  } | null {
    if (!activeWorkout.value) return null;
    const currentEx = getCurrentExercise();
    if (!currentEx) return null;

    const completedEx = activeWorkout.value.completedExercises.find(
      (ex) => ex.exerciseId === currentEx.id
    );
    const completedSets = completedEx?.sets || [];
    const currentSet = completedSets.length + 1;
    const totalSets = getTargetSetsForWeek();

    return {
      currentSet,
      totalSets,
      completedSets,
    };
  }

  function updateActiveWorkoutWeight(exerciseId: number, weight: number) {
    if (!activeWorkout.value) return;
    // Update the exercise's current weight in the main state
    updateExerciseWeight(exerciseId, weight);
  }

  function completeSet(weight: number, reps: number) {
    if (!activeWorkout.value) return;

    const currentEx = getCurrentExercise();
    if (!currentEx) return;

    const completedEx = activeWorkout.value.completedExercises.find(
      (ex) => ex.exerciseId === currentEx.id
    );
    if (!completedEx) return;

    // Add the completed set
    completedEx.sets.push({
      weight,
      reps,
      completed: true,
    });

    // Update exercise weight to the highest used
    const maxWeight = Math.max(...completedEx.sets.map((s) => s.weight));
    updateExerciseWeight(currentEx.id, maxWeight);

    // Auto-save progress
    // (state is already auto-saved via watch, but we can trigger explicit save if needed)
  }

  function nextExercise() {
    if (!activeWorkout.value) return;
    if (
      activeWorkout.value.currentExerciseIndex <
      activeWorkout.value.exercises.length - 1
    ) {
      activeWorkout.value.currentExerciseIndex += 1;
    }
  }

  function previousExercise() {
    if (!activeWorkout.value) return;
    if (activeWorkout.value.currentExerciseIndex > 0) {
      activeWorkout.value.currentExerciseIndex -= 1;
    }
  }

  function isExerciseComplete(exerciseId: number): boolean {
    if (!activeWorkout.value) return false;
    const completedEx = activeWorkout.value.completedExercises.find(
      (ex) => ex.exerciseId === exerciseId
    );
    if (!completedEx) return false;
    return completedEx.sets.length >= getTargetSetsForWeek();
  }

  function isWorkoutComplete(): boolean {
    if (!activeWorkout.value) return false;
    return activeWorkout.value.exercises.every((ex) =>
      isExerciseComplete(ex.id)
    );
  }

  function finishWorkout() {
    if (!activeWorkout.value) return;

    const session: WorkoutSession = {
      date: activeWorkout.value.startTime,
      week: currentWeek.value,
      day: currentDay.value,
      exercises: activeWorkout.value.completedExercises,
    };

    completeWorkout(session);
    activeWorkout.value = null;
  }

  function cancelWorkout() {
    activeWorkout.value = null;
  }

  const isWorkoutActive = computed(() => activeWorkout.value !== null);
  const canGoNext = computed(() => {
    if (!activeWorkout.value) return false;
    return (
      activeWorkout.value.currentExerciseIndex <
      activeWorkout.value.exercises.length - 1
    );
  });
  const canGoPrevious = computed(() => {
    if (!activeWorkout.value) return false;
    return activeWorkout.value.currentExerciseIndex > 0;
  });

  return {
    // State
    state,
    // Computed
    currentWeek,
    currentDay,
    exercises,
    workoutHistory,
    user,
    unit,
    currentDayExercises,
    nextDayExercises,
    // Actions
    updateUser,
    updateExerciseWeight,
    updateExerciseBaseWeight,
    completeWorkout,
    resetProgram,
    getTargetWeightForExercise,
    getTargetRepsForWeek,
    getTargetSetsForWeek,
    // Active workout
    activeWorkout,
    isWorkoutActive,
    canGoNext,
    canGoPrevious,
    startWorkout,
    getCurrentExercise,
    getCurrentExerciseProgress,
    updateActiveWorkoutWeight,
    completeSet,
    nextExercise,
    previousExercise,
    isExerciseComplete,
    isWorkoutComplete,
    finishWorkout,
    cancelWorkout,
  };
});

