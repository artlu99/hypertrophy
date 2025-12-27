/**
 * Type definitions for the Hypertrophy workout tracking system
 */

export type WeightUnit = 'kg' | 'lbs';
export type WorkoutDay = 'A' | 'B';

export interface Exercise {
  id: number;
  name: string;
  baseWeight: number;
  currentWeight: number;
  workoutDay: WorkoutDay; // Which day this exercise belongs to
}

export interface CompletedSet {
  weight: number;
  reps: number;
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
  currentDay: WorkoutDay; // 'A' or 'B'
  lastWorkoutDate: string | null; // ISO date string
  totalWorkoutsCompleted: number;
}

export interface WorkoutState {
  user: User;
  program: Program;
  exercises: Exercise[];
  workoutHistory: WorkoutSession[];
}

