/**
 * Progression calculation utilities for the 12-week program
 */

import type { Exercise } from '../types/workout';

/**
 * Weight increment per week (in kg)
 * For lbs, multiply by 2.2
 */
const WEIGHT_INCREMENT_WEEKS_1_4 = 2.5; // kg per week
const WEIGHT_INCREMENT_WEEKS_9_12 = 5; // kg per week (larger increment)

/**
 * Get target reps for a given week
 * Weeks 1-4: 3 reps
 * Weeks 5-12: 5 reps
 */
export function getTargetReps(week: number): number {
  if (week >= 1 && week <= 4) {
    return 3;
  }
  if (week >= 5 && week <= 12) {
    return 5;
  }
  // Fallback
  return 5;
}

/**
 * Get target sets (always 3)
 */
export function getTargetSets(): number {
  return 3;
}

/**
 * Calculate target weight for an exercise at a specific week
 * 
 * Weeks 1-4: Base Weight + ((Week - 1) × Increment)
 * Weeks 5-8: Maintain Week 4 weight (or slight deload)
 * Weeks 9-12: Week 8 Weight + ((Week - 8) × Larger Increment)
 */
export function getTargetWeight(
  exercise: Exercise,
  week: number,
  unit: 'kg' | 'lbs' = 'kg'
): number {
  // Convert to kg if needed
  const baseWeightKg =
    unit === 'lbs' ? exercise.baseWeight / 2.20462 : exercise.baseWeight;
  const increment1_4 =
    unit === 'lbs'
      ? WEIGHT_INCREMENT_WEEKS_1_4 * 2.20462
      : WEIGHT_INCREMENT_WEEKS_1_4;
  const increment9_12 =
    unit === 'lbs'
      ? WEIGHT_INCREMENT_WEEKS_9_12 * 2.20462
      : WEIGHT_INCREMENT_WEEKS_9_12;

  let targetWeight: number;

  if (week >= 1 && week <= 4) {
    // Weeks 1-4: Linear progression
    targetWeight = baseWeightKg + (week - 1) * increment1_4;
  } else if (week >= 5 && week <= 8) {
    // Weeks 5-8: Maintain Week 4 weight
    const week4Weight = baseWeightKg + 3 * increment1_4;
    targetWeight = week4Weight;
  } else if (week >= 9 && week <= 12) {
    // Weeks 9-12: Larger increment from Week 8 weight
    const week4Weight = baseWeightKg + 3 * increment1_4;
    const week8Weight = week4Weight; // Same as week 4
    targetWeight = week8Weight + (week - 8) * increment9_12;
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
 */
export function shouldAdvanceWeek(
  currentDay: 'A' | 'B',
  workoutCompleted: boolean
): boolean {
  // Advance week when completing Workout B (completing a full cycle)
  return workoutCompleted && currentDay === 'B';
}

/**
 * Get the next workout day (A -> B, B -> A)
 */
export function getNextDay(currentDay: 'A' | 'B'): 'A' | 'B' {
  return currentDay === 'A' ? 'B' : 'A';
}

/**
 * Check if a week is valid (1-12)
 */
export function isValidWeek(week: number): boolean {
  return week >= 1 && week <= 12;
}

