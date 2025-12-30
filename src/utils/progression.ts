/**
 * Progression calculation utilities for the 12-week program
 */

import type { Exercise } from '../types/workout';

/**
 * Weight increment per week (in kg)
 * Based on 12 Week Plan: Progressive overload
 * For dumbbell exercises, smaller increments (2.5kg = 1.25kg per dumbbell)
 * For lbs, multiply by 2.2
 */
const WEIGHT_INCREMENT_WEEKS_1_2 = 0; // Weeks 1-2: Focus on form, no weight increase
const WEIGHT_INCREMENT_WEEKS_3_12 = 2.5; // kg per week (1.25kg per dumbbell)

/**
 * Get target reps for a given week
 * Based on 12 Week Plan: 3 sets of 10-12 reps for most exercises
 * Weeks 1-2: Focus on form, use 10 reps as target
 * Weeks 3-12: Progressive overload, target 10-12 reps (use 11 as middle target)
 */
export function getTargetReps(week: number): number {
  if (week >= 1 && week <= 2) {
    // Weeks 1-2: Focus on form, don't go to failure
    return 10;
  }
  if (week >= 3 && week <= 12) {
    // Weeks 3-12: Progressive overload, aim for 10-12 reps
    // Using 11 as the target (middle of 10-12 range)
    return 11;
  }
  // Fallback
  return 11;
}

/**
 * Get target sets (always 3)
 */
export function getTargetSets(): number {
  return 3;
}

/**
 * Calculate target weight for an exercise at a specific week
 * Based on 12 Week Plan: Progressive overload
 * 
 * Weeks 1-2: Base Weight (focus on form, no weight increase)
 * Weeks 3-12: Base Weight + ((Week - 2) × Increment)
 * 
 * For bodyweight exercises (weight = 0), always return 0
 */
export function getTargetWeight(
  exercise: Exercise,
  week: number,
  unit: 'kg' | 'lbs' = 'kg'
): number {
  // Bodyweight exercises (Push-Ups, Plank) always return 0
  if (exercise.baseWeight === 0) {
    return 0;
  }

  // Convert to kg if needed
  const baseWeightKg =
    unit === 'lbs' ? exercise.baseWeight / 2.20462 : exercise.baseWeight;
  const increment =
    unit === 'lbs'
      ? WEIGHT_INCREMENT_WEEKS_3_12 * 2.20462
      : WEIGHT_INCREMENT_WEEKS_3_12;

  let targetWeight: number;

  if (week >= 1 && week <= 2) {
    // Weeks 1-2: Focus on form, no weight increase
    targetWeight = baseWeightKg;
  } else if (week >= 3 && week <= 12) {
    // Weeks 3-12: Progressive overload
    // Start incrementing from week 3, so (week - 2) weeks of increments
    targetWeight = baseWeightKg + (week - 2) * increment;
  } else {
    // Fallback: use current weight or base weight
    targetWeight = exercise.currentWeight || baseWeightKg;
  }

  // Round to nearest 0.5 (for kg) or 1 (for lbs)
  if (unit === 'lbs') {
    return Math.round(targetWeight);
  }
  return Math.round(targetWeight * 2) / 2; // Round to nearest 0.5
}

/**
 * Determine if the program should advance to the next week
 * This happens when a workout is completed
 * 
 * Advance week after completing Day C (the last day of the week)
 */
export function shouldAdvanceWeek(
  currentDay: 'A' | 'B' | 'C',
  workoutCompleted: boolean
): boolean {
  // Advance week when completing Day C (the last day of the week)
  return workoutCompleted && currentDay === 'C';
}

/**
 * Get the next workout day (A -> B -> C -> A)
 */
export function getNextDay(currentDay: 'A' | 'B' | 'C'): 'A' | 'B' | 'C' {
  if (currentDay === 'A') return 'B';
  if (currentDay === 'B') return 'C';
  return 'A'; // C -> A (will trigger week advancement)
}

/**
 * Check if a week is valid (1-12)
 */
export function isValidWeek(week: number): boolean {
  return week >= 1 && week <= 12;
}

