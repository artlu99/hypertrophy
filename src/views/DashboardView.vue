<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '../stores/workout';
import AppLayout from '../components/layout/AppLayout.vue';
import ScreenContainer from '../components/layout/ScreenContainer.vue';
import ProgressBar from '../components/common/ProgressBar.vue';
import WeekDayDisplay from '../components/dashboard/WeekDayDisplay.vue';
import NextWorkoutPreview from '../components/dashboard/NextWorkoutPreview.vue';
import StartWorkoutButton from '../components/dashboard/StartWorkoutButton.vue';
import BigButton from '../components/common/BigButton.vue';

const router = useRouter();
const workoutStore = useWorkoutStore();

const progress = computed(() => ({
  current: workoutStore.currentWeek,
  total: 12,
}));

function handleStartWorkout() {
  router.push('/workout');
}

function handleViewHistory() {
  router.push('/history');
}

function handleViewSettings() {
  router.push('/settings');
}
</script>

<template>
  <AppLayout>
    <ScreenContainer>
      <div class="dashboard">
        <!-- Top Section: Week/Day Display and Progress Bar -->
        <div class="dashboard__top">
          <div class="dashboard__header">
            <WeekDayDisplay />
          </div>
          <div class="dashboard__progress">
            <ProgressBar
              :current="progress.current"
              :total="progress.total"
              size="lg"
            />
          </div>
        </div>

        <!-- Middle Section: Next Workout Preview -->
        <div class="dashboard__preview">
          <NextWorkoutPreview />
        </div>

        <!-- Bottom Section: Action Buttons -->
        <div class="dashboard__actions">
          <div class="dashboard__start">
            <StartWorkoutButton @start="handleStartWorkout" />
          </div>
          <div class="dashboard__nav">
            <BigButton
              label="History"
              variant="secondary"
              size="md"
              full-width
              @click="handleViewHistory"
            />
            <BigButton
              label="Settings"
              variant="secondary"
              size="md"
              full-width
              @click="handleViewSettings"
            />
          </div>
        </div>
      </div>
    </ScreenContainer>
  </AppLayout>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-lg) 0;
  min-height: 100vh;
  min-height: 100dvh;
}

/* Top section with columnar layout */
.dashboard__top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

.dashboard__header {
  grid-column: 1;
}

.dashboard__progress {
  grid-column: 2;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: var(--spacing-sm);
}

/* Middle section */
.dashboard__preview {
  width: 100%;
  flex: 1;
}

/* Bottom section with full-width buttons */
.dashboard__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  margin-top: auto;
  padding-top: var(--spacing-xl);
}

.dashboard__start {
  width: 100%;
}

.dashboard__nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

/* Adjust progress bar size for top right quarter */
.dashboard__progress :deep(.progress-bar) {
  width: 100%;
  max-width: 100%;
}

.dashboard__progress :deep(.progress-bar--lg .progress-bar__label) {
  font-size: var(--font-size-lg);
}

.dashboard__progress :deep(.progress-bar--lg .progress-bar__current) {
  font-size: var(--font-size-xl);
}

.dashboard__progress :deep(.progress-bar--lg .progress-bar__separator),
.dashboard__progress :deep(.progress-bar--lg .progress-bar__total) {
  font-size: var(--font-size-base);
}

.dashboard__progress :deep(.progress-bar--lg .progress-bar__track) {
  height: 8px;
}

@media (min-width: 768px) {
  .dashboard {
    gap: var(--spacing-2xl);
    padding: var(--spacing-xl) 0;
    max-width: 600px;
  }

  .dashboard__top {
    gap: var(--spacing-xl);
  }

  .dashboard__progress :deep(.progress-bar--lg .progress-bar__label) {
    font-size: var(--font-size-xl);
  }

  .dashboard__progress :deep(.progress-bar--lg .progress-bar__current) {
    font-size: var(--font-size-2xl);
  }

  .dashboard__progress :deep(.progress-bar--lg .progress-bar__separator),
  .dashboard__progress :deep(.progress-bar--lg .progress-bar__total) {
    font-size: var(--font-size-lg);
  }

  .dashboard__progress :deep(.progress-bar--lg .progress-bar__track) {
    height: 10px;
  }
}

/* Mobile adjustments for smaller screens */
@media (max-width: 480px) {
  .dashboard__top {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .dashboard__header {
    grid-column: 1;
  }

  .dashboard__progress {
    grid-column: 1;
    justify-content: center;
    padding-top: 0;
  }
}
</style>

