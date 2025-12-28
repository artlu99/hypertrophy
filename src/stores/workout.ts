/**
 * Pinia store for workout state management
 * Handles all workout data with localStorage persistence
 */

import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { DEFAULT_EXERCISES } from "../config/exercises";
import type {
  CompletedExercise,
  CompletedSet,
  Exercise,
  WeightUnit,
  WorkoutDay,
  WorkoutSession,
  WorkoutState,
} from "../types/workout";
import {
  getNextDay,
  getTargetReps,
  getTargetSets,
  getTargetWeight,
  shouldAdvanceWeek,
} from "../utils/progression";
import {
  exportState,
  importState,
  loadState,
  saveState,
} from "../utils/storage";

/**
 * Create initial default state
 */
function createInitialState(): WorkoutState {
  const exercises: Exercise[] = DEFAULT_EXERCISES.map((ex) => ({
    ...ex,
    currentWeight: ex.baseWeight,
    currentTime: ex.currentTime || ex.baseTime || undefined,
    currentReps: ex.currentReps || ex.baseReps || undefined,
  }));

  return {
    user: {
      name: "Lifter",
      unit: "kg",
    },
    program: {
      currentWeek: 1,
      currentDay: "A",
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
  // Track current values for active exercise
  currentReps: Map<number, number>; // exerciseId -> current reps
  currentTime: Map<number, number>; // exerciseId -> current target time (seconds)
}

export const useWorkoutStore = defineStore("workout", () => {
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
    return exercises.value.filter((ex) => ex.workoutDay === currentDay.value);
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
    { deep: true },
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

  function updateExerciseBaseReps(exerciseId: number, baseReps: number) {
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      exercise.baseReps = baseReps;
      exercise.currentReps = baseReps;
    }
  }

  function updateExerciseBaseTime(exerciseId: number, baseTime: number) {
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      exercise.baseTime = baseTime;
      exercise.currentTime = baseTime;
    }
  }

  function completeWorkout(session: WorkoutSession) {
    // Add to history
    state.value.workoutHistory.push(session);

    // Update exercise weights based on completed sets
    session.exercises.forEach((completedEx) => {
      const exercise = state.value.exercises.find(
        (ex) => ex.id === completedEx.exerciseId,
      );
      if (exercise && completedEx.sets.length > 0) {
        // Update to the highest weight used in the workout
        const maxWeight = Math.max(
          ...completedEx.sets.map((set) => set.weight),
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
      state.value.program.currentDay = "A";
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
    return getTargetWeight(exercise, currentWeek.value, state.value.user.unit);
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
      console.warn("No exercises found for current day");
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
      currentReps: new Map(),
      currentTime: new Map(
        exercisesForDay
          .filter((ex) => ex.trackingType === 'time')
          .map((ex) => [ex.id, ex.currentTime || ex.baseTime || 30])
      ),
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
      (ex) => ex.exerciseId === currentEx.id,
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

  function updateActiveWorkoutReps(exerciseId: number, reps: number) {
    if (!activeWorkout.value) return;
    activeWorkout.value.currentReps.set(exerciseId, reps);
  }

  function updateActiveWorkoutTime(exerciseId: number, time: number) {
    if (!activeWorkout.value) return;
    activeWorkout.value.currentTime.set(exerciseId, time);
    // Also update the exercise's currentTime in the main state
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      exercise.currentTime = time;
    }
  }

  function getCurrentReps(exerciseId: number): number {
    if (!activeWorkout.value) {
      // If no active workout, return the exercise's stored currentReps
      const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
      return exercise?.currentReps || exercise?.baseReps || 0;
    }
    // During active workout, use the tracked reps or fall back to stored value
    const trackedReps = activeWorkout.value.currentReps.get(exerciseId);
    if (trackedReps !== undefined) return trackedReps;
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    return exercise?.currentReps || exercise?.baseReps || 0;
  }

  function getCurrentTime(exerciseId: number): number {
    if (!activeWorkout.value) return 30;
    const exercise = state.value.exercises.find((ex) => ex.id === exerciseId);
    return activeWorkout.value.currentTime.get(exerciseId) || exercise?.currentTime || exercise?.baseTime || 30;
  }

  function completeSet(weight: number, reps: number, time?: number) {
    if (!activeWorkout.value) return;

    const currentEx = getCurrentExercise();
    if (!currentEx) return;

    const completedEx = activeWorkout.value.completedExercises.find(
      (ex) => ex.exerciseId === currentEx.id,
    );
    if (!completedEx) return;

    // Determine actual values based on tracking type
    const trackingType = currentEx.trackingType || 'weight';
    let actualWeight = weight;
    let actualReps = reps;
    let actualTime = time;

    if (trackingType === 'reps') {
      // For reps-based, use the tracked reps
      actualReps = activeWorkout.value.currentReps.get(currentEx.id) || reps;
      actualWeight = 0; // No weight for reps-based
    } else if (trackingType === 'time') {
      // For time-based, use the tracked time
      actualTime = activeWorkout.value.currentTime.get(currentEx.id) || time || 30;
      actualWeight = 0; // No weight for time-based
      actualReps = 0; // No reps for time-based
    }

    // Add the completed set
    completedEx.sets.push({
      weight: actualWeight,
      reps: actualReps,
      time: actualTime,
      completed: true,
    });

    // Update exercise values based on tracking type
    if (trackingType === 'weight') {
      // Update weight to the highest used
      const maxWeight = Math.max(...completedEx.sets.map((s) => s.weight));
      updateExerciseWeight(currentEx.id, maxWeight);
    } else if (trackingType === 'reps') {
      // Update reps to the highest achieved
      const allReps = completedEx.sets.map((s) => s.reps).filter((r) => r > 0);
      if (allReps.length > 0) {
        const maxReps = Math.max(...allReps);
        const exercise = state.value.exercises.find((ex) => ex.id === currentEx.id);
        if (exercise) {
          exercise.currentReps = maxReps;
        }
      }
    } else if (trackingType === 'time') {
      // Time is already updated via updateActiveWorkoutTime
      // Could track max time achieved if needed
    }

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
      (ex) => ex.exerciseId === exerciseId,
    );
    if (!completedEx) return false;
    return completedEx.sets.length >= getTargetSetsForWeek();
  }

  function isWorkoutComplete(): boolean {
    if (!activeWorkout.value) return false;
    return activeWorkout.value.exercises.every((ex) =>
      isExerciseComplete(ex.id),
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

  // Export/Import functionality
  function exportData(): string {
    return exportState(state.value);
  }

  function importData(json: string): { success: boolean; error?: string } {
    if (!activeWorkout.value) {
      const imported = importState(json);
      if (!imported) {
        return { success: false, error: "Invalid JSON format" };
      }

      // Validate the imported data structure
      if (
        !imported.user ||
        !imported.program ||
        !imported.exercises ||
        !imported.workoutHistory
      ) {
        return { success: false, error: "Invalid data structure" };
      }

      // Validate exercises array
      if (
        !Array.isArray(imported.exercises) ||
        imported.exercises.length === 0
      ) {
        return { success: false, error: "No exercises found" };
      }

      // Validate workout history
      if (!Array.isArray(imported.workoutHistory)) {
        return { success: false, error: "Invalid workout history format" };
      }

      // Replace current state with imported data
      state.value = imported;
      return { success: true };
    } else {
      return {
        success: false,
        error: "Cannot import data while a workout is active",
      };
    }
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
    updateExerciseBaseReps,
    updateExerciseBaseTime,
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
    updateActiveWorkoutReps,
    updateActiveWorkoutTime,
    getCurrentReps,
    getCurrentTime,
    completeSet,
    nextExercise,
    previousExercise,
    isExerciseComplete,
    isWorkoutComplete,
    finishWorkout,
    cancelWorkout,
    // Export/Import
    exportData,
    importData,
  };
});
