/**
 * Error handling composable
 * Provides centralized error handling and user feedback
 */

import { ref } from 'vue';

export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
}

const errors = ref<AppError[]>([]);
const maxErrors = 5;

export function useErrorHandler() {
  function addError(message: string, code?: string) {
    const error: AppError = {
      message,
      code,
      timestamp: Date.now(),
    };
    
    errors.value.unshift(error);
    
    // Keep only the last N errors
    if (errors.value.length > maxErrors) {
      errors.value = errors.value.slice(0, maxErrors);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeError(error);
    }, 5000);
  }

  function removeError(error: AppError) {
    const index = errors.value.findIndex(
      (e) => e.timestamp === error.timestamp
    );
    if (index > -1) {
      errors.value.splice(index, 1);
    }
  }

  function clearErrors() {
    errors.value = [];
  }

  function handleAsyncError(error: unknown, defaultMessage = 'An error occurred') {
    if (error instanceof Error) {
      addError(error.message || defaultMessage);
    } else if (typeof error === 'string') {
      addError(error);
    } else {
      addError(defaultMessage);
    }
  }

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleAsyncError,
  };
}

