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

export const useWorkoutStore = defineStore('workout', () => {
  // State
  const state = ref<WorkoutState>(createInitialState());

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

    // Advance week if completing Workout B
    if (shouldAdvanceWeek(currentDay.value, true)) {
      if (state.value.program.currentWeek < 12) {
        state.value.program.currentWeek += 1;
      }
      // Reset to day A for next week
      state.value.program.currentDay = 'A';
    } else {
      // Switch to next day
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
  };
});

