/**
 * LocalStorage persistence utilities
 */

import type { WorkoutState } from '../types/workout';

const STORAGE_KEY = 'hypertrophy-state';
const STORAGE_VERSION = '1.0.1';

interface StoredState {
  version: string;
  data: WorkoutState;
}

/**
 * Load state from localStorage
 */
export function loadState(): WorkoutState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed: StoredState = JSON.parse(stored);
    
    // Version check (for future migrations)
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(
        `Storage version mismatch: ${parsed.version} vs ${STORAGE_VERSION}`
      );
      // Could implement migration logic here
    }

    return parsed.data;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * Save state to localStorage
 */
export function saveState(state: WorkoutState): boolean {
  try {
    const toStore: StoredState = {
      version: STORAGE_VERSION,
      data: state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    return true;
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
    return false;
  }
}

/**
 * Clear all stored state
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
}

/**
 * Export state as JSON string (for backup/import)
 */
export function exportState(state: WorkoutState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Import state from JSON string (for restore)
 */
export function importState(json: string): WorkoutState | null {
  try {
    const parsed = JSON.parse(json);
    return parsed as WorkoutState;
  } catch (error) {
    console.error('Failed to import state from JSON:', error);
    return null;
  }
}

