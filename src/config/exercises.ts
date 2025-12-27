/**
 * Exercise configuration for the 12-week program
 */

import type { Exercise } from '../types/workout';

/**
 * Default exercises for Workout A and Workout B
 * Squat appears in both days (3x/week frequency)
 */
export const DEFAULT_EXERCISES: Omit<Exercise, 'currentWeight'>[] = [
  // Workout A
  { id: 1, name: 'Squat', baseWeight: 60, workoutDay: 'A' },
  { id: 2, name: 'Overhead Press', baseWeight: 40, workoutDay: 'A' },
  { id: 3, name: 'Deadlift', baseWeight: 80, workoutDay: 'A' },
  
  // Workout B
  { id: 4, name: 'Squat', baseWeight: 60, workoutDay: 'B' },
  { id: 5, name: 'Bench Press', baseWeight: 50, workoutDay: 'B' },
  { id: 6, name: 'Barbell Row', baseWeight: 45, workoutDay: 'B' },
];

/**
 * Get exercises for a specific workout day
 */
export function getExercisesForDay(
  exercises: Exercise[],
  day: 'A' | 'B'
): Exercise[] {
  return exercises.filter((ex) => ex.workoutDay === day);
}

/**
 * Get exercise by ID
 */
export function getExerciseById(
  exercises: Exercise[],
  id: number
): Exercise | undefined {
  return exercises.find((ex) => ex.id === id);
}

