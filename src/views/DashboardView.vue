<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import GhostButton from "../components/common/GhostButton.vue";
import NextWorkoutPreview from "../components/dashboard/NextWorkoutPreview.vue";
import StartWorkoutButton from "../components/dashboard/StartWorkoutButton.vue";
import WorkoutDisplay from "../components/dashboard/WorkoutDisplay.vue";
import AppLayout from "../components/layout/AppLayout.vue";
import ScreenContainer from "../components/layout/ScreenContainer.vue";
import { useWorkoutStore } from "../stores/workout";

const router = useRouter();
const workoutStore = useWorkoutStore();

const progress = computed(() => ({
	current: workoutStore.currentWeek,
	total: 12,
}));

function handleStartWorkout() {
	router.push("/workout");
}

function handleViewHistory() {
	router.push("/history");
}

function handleViewSettings() {
	router.push("/settings");
}
</script>

<template>
  <AppLayout>
    <ScreenContainer>
      <div class="dashboard">
        <!-- Top Section: Week/Day Display and Progress Bar -->
        <div class="dashboard__top">
          <div class="dashboard__top-row">
            <div class="dashboard__header">
              <WorkoutDisplay />
            </div>
            <div class="dashboard__week-label">
              Week
              <span class="dashboard__week-current">{{ progress.current }}</span>
              <span class="dashboard__week-separator">/</span>
              <span class="dashboard__week-total">{{ progress.total }}</span>
            </div>
          </div>
          <div class="dashboard__progress-track">
            <div
              class="dashboard__progress-fill"
              :style="{ width: `${Math.min(100, Math.max(0, (progress.current / progress.total) * 100))}%` }"
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
            <GhostButton
              label=" 🗓️ History"
              variant="secondary"
              size="md"
              @click="handleViewHistory"
            />
            <GhostButton
              label="Settings ⚙️"
              variant="secondary"
              size="md"
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
  gap: var(--spacing-md);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-lg);
  min-height: 100vh;
  min-height: 100dvh;
}

/* Top section with two rows */
.dashboard__top {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  position: relative;
}

.dashboard__top-row {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: var(--spacing-sm);
  align-items: center;
}

.dashboard__header {
  grid-column: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.dashboard__week-label {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.dashboard__week-current {
  color: var(--color-gold);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-extrabold);
}

.dashboard__week-separator {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dashboard__week-total {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.dashboard__progress-track {
  width: 100%;
  height: 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-top: var(--spacing-xs);
}

.dashboard__progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-gold) 0%,
    var(--color-gold-hover) 100%
  );
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
  box-shadow: 0 0 8px var(--color-gold-light);
}

/* Middle section */
.dashboard__preview {
  width: 100%;
  flex: 1;
  margin-bottom: var(--spacing-xs);
}

/* Bottom section with full-width buttons */
.dashboard__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  margin-top: auto;
  padding-top: var(--spacing-sm);
}

.dashboard__start {
  width: 100%;
}

.dashboard__nav {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-md);
  width: 100%;
}


@media (min-width: 768px) {
  .dashboard {
    gap: var(--spacing-lg);
    padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-xl);
    max-width: 600px;
  }

  .dashboard__top {
    gap: var(--spacing-sm);
  }

  .dashboard__top-row {
    grid-template-columns: 4fr 1fr;
  }

  .dashboard__week-label {
    font-size: var(--font-size-base);
  }

  .dashboard__week-current {
    font-size: var(--font-size-lg);
  }

  .dashboard__week-separator,
  .dashboard__week-total {
    font-size: var(--font-size-base);
  }

  .dashboard__progress-track {
    height: 6px;
  }

  .dashboard__actions {
    padding-top: var(--spacing-md);
  }
}

/* Mobile adjustments for smaller screens */
@media (max-width: 480px) {
  .dashboard__top-row {
    grid-template-columns: 2fr 1fr;
  }
}
</style>

