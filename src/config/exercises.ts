/**
 * Exercise configuration for the 12-week program
 * Based on the 12 Week Plan from WORKOUT.md
 */

import type { Exercise } from '../types/workout';

/**
 * Default exercises for the 12-week hypertrophy program
 * All exercises are in Workout A (exercises A-F from the plan)
 * 
 * A. Dumbbell Goblet Squat - 3 sets of 10-12 reps
 * B. Push-Ups - 3 sets to failure (bodyweight, weight = 0)
 * C. Dumbbell Overhead Press - 3 sets of 10-12 reps
 * D. Dumbbell Romanian Deadlift (RDL) - 3 sets of 10-12 reps
 * E. Dumbbell Bent-Over Row - 3 sets of 10-12 reps
 * F. Plank - 3 rounds, hold for as long as possible (bodyweight, weight = 0)
 */
export const DEFAULT_EXERCISES: Omit<Exercise, 'currentWeight'>[] = [
  // A. Dumbbell Goblet Squat
  { id: 1, name: 'Dumbbell Goblet Squat', baseWeight: 20, workoutDay: 'A', trackingType: 'weight' },
  
  // B. Push-Ups (reps-based, track reps instead of weight)
  // baseReps defaults to week-based target (10 for weeks 1-2, 11 for weeks 3-12)
  { id: 2, name: 'Push-Ups', baseWeight: 0, workoutDay: 'A', trackingType: 'reps', baseReps: 15 },
  
  // C. Dumbbell Overhead Press (Standing)
  { id: 3, name: 'Dumbbell Overhead Press', baseWeight: 20, workoutDay: 'A', trackingType: 'weight' },
  
  // D. Dumbbell Romanian Deadlift (RDL)
  { id: 4, name: 'Dumbbell Romanian Deadlift', baseWeight: 20, workoutDay: 'A', trackingType: 'weight' },
  
  // E. Dumbbell Bent-Over Row
  { id: 5, name: 'Dumbbell Bent-Over Row', baseWeight: 10, workoutDay: 'A', trackingType: 'weight' },
  
  // F. Plank (time-based, track hold time)
  { id: 6, name: 'Plank', baseWeight: 0, workoutDay: 'A', trackingType: 'time', baseTime: 30, currentTime: 30 },
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

