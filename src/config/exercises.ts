/**
 * Exercise configuration for the 12-week program
 * Based on the 12 Week Plan from WORKOUT.md
 */

import type { Exercise, WorkoutDay } from '../types/workout';

/**
 * Default exercises for the 12-week hypertrophy program
 * Exercises A-F are replicated across Workout A, B, and C
 * 
 * A. Dumbbell Goblet Squat - 3 sets of 10-12 reps
 * B. Push-Ups - 3 sets to failure (bodyweight, weight = 0)
 * C. Dumbbell Overhead Press - 3 sets of 10-12 reps
 * D. Dumbbell Romanian Deadlift (RDL) - 3 sets of 10-12 reps
 * E. Dumbbell Bent-Over Row - 3 sets of 10-12 reps
 * F. Plank - 3 rounds, hold for as long as possible (bodyweight, weight = 0)
 */
export const DEFAULT_EXERCISES: Omit<Exercise, 'currentWeight'>[] = [
  // Workout A - Exercises A-F (IDs 1-6)
  { id: 1, name: 'Dumbbell Goblet Squat', baseWeight: 20, workoutDay: 'A', trackingType: 'weight' },
  { id: 2, name: 'Push-Ups', baseWeight: 0, workoutDay: 'A', trackingType: 'reps', baseReps: 15 },
  { id: 3, name: 'Dumbbell Overhead Press', baseWeight: 20, workoutDay: 'A', trackingType: 'weight' },
  { id: 4, name: 'Dumbbell Romanian Deadlift', baseWeight: 20, workoutDay: 'A', trackingType: 'weight' },
  { id: 5, name: 'Dumbbell Bent-Over Row', baseWeight: 10, workoutDay: 'A', trackingType: 'weight' },
  { id: 6, name: 'Plank', baseWeight: 0, workoutDay: 'A', trackingType: 'time', baseTime: 30, currentTime: 30 },
  
  // Workout B - Exercises A-F (IDs 7-12) - Carbon copy of Workout A
  { id: 7, name: 'Dumbbell Goblet Squat', baseWeight: 20, workoutDay: 'B', trackingType: 'weight' },
  { id: 8, name: 'Push-Ups', baseWeight: 0, workoutDay: 'B', trackingType: 'reps', baseReps: 15 },
  { id: 9, name: 'Dumbbell Overhead Press', baseWeight: 20, workoutDay: 'B', trackingType: 'weight' },
  { id: 10, name: 'Dumbbell Romanian Deadlift', baseWeight: 20, workoutDay: 'B', trackingType: 'weight' },
  { id: 11, name: 'Dumbbell Bent-Over Row', baseWeight: 10, workoutDay: 'B', trackingType: 'weight' },
  { id: 12, name: 'Plank', baseWeight: 0, workoutDay: 'B', trackingType: 'time', baseTime: 30, currentTime: 30 },
  
  // Workout C - Exercises A-F (IDs 13-18) - Carbon copy of Workout A
  { id: 13, name: 'Dumbbell Goblet Squat', baseWeight: 20, workoutDay: 'C', trackingType: 'weight' },
  { id: 14, name: 'Push-Ups', baseWeight: 0, workoutDay: 'C', trackingType: 'reps', baseReps: 15 },
  { id: 15, name: 'Dumbbell Overhead Press', baseWeight: 20, workoutDay: 'C', trackingType: 'weight' },
  { id: 16, name: 'Dumbbell Romanian Deadlift', baseWeight: 20, workoutDay: 'C', trackingType: 'weight' },
  { id: 17, name: 'Dumbbell Bent-Over Row', baseWeight: 10, workoutDay: 'C', trackingType: 'weight' },
  { id: 18, name: 'Plank', baseWeight: 0, workoutDay: 'C', trackingType: 'time', baseTime: 30, currentTime: 30 },
];

/**
 * Get exercises for a specific workout day
 */
export function getExercisesForDay(
  exercises: Exercise[],
  day: WorkoutDay,
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

