/**
 * Type definitions for the Hypertrophy workout tracking system
 */

export type WeightUnit = 'kg' | 'lbs';
export type WorkoutDay = 'A' | 'B' | 'C';
export type ExerciseTrackingType = 'weight' | 'reps' | 'time';

export interface Exercise {
  id: number;
  name: string;
  baseWeight: number;
  currentWeight: number;
  workoutDay: WorkoutDay; // Which day this exercise belongs to
  trackingType?: ExerciseTrackingType; // How this exercise is tracked (default: 'weight')
  baseTime?: number; // Base time in seconds for time-based exercises (e.g., Plank)
  currentTime?: number; // Current target time in seconds for time-based exercises
  baseReps?: number; // Base/target reps for reps-based exercises (e.g., Push-Ups)
  currentReps?: number; // Typical/average reps achieved for progression tracking
}

export interface CompletedSet {
  weight: number; // For weight-based exercises
  reps: number; // For reps-based exercises (or weight-based)
  time?: number; // For time-based exercises (in seconds)
  completed: boolean;
}

export interface CompletedExercise {
  exerciseId: number;
  sets: CompletedSet[];
}

export interface WorkoutSession {
  date: string; // ISO date string
  week: number; // 1-12
  day: WorkoutDay;
  exercises: CompletedExercise[];
}

export interface User {
  name: string;
  unit: WeightUnit;
}

export interface Program {
  currentWeek: number; // 1-12
  currentDay: WorkoutDay; // 'A', 'B', or 'C'
  lastWorkoutDate: string | null; // ISO date string
  totalWorkoutsCompleted: number;
}

export interface WorkoutState {
  user: User;
  program: Program;
  exercises: Exercise[];
  workoutHistory: WorkoutSession[];
}

