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
</script>

<template>
  <AppLayout>
    <ScreenContainer>
      <div class="dashboard">
        <!-- Week/Day Display -->
        <div class="dashboard__header">
          <WeekDayDisplay />
        </div>

        <!-- Progress Bar -->
        <div class="dashboard__progress">
          <ProgressBar
            :current="progress.current"
            :total="progress.total"
            size="lg"
          />
        </div>

        <!-- Next Workout Preview -->
        <div class="dashboard__preview">
          <NextWorkoutPreview />
        </div>

        <!-- Start Workout Button -->
        <div class="dashboard__start">
          <StartWorkoutButton @start="handleStartWorkout" />
        </div>

        <!-- Navigation -->
        <div class="dashboard__nav">
          <BigButton
            label="History"
            variant="secondary"
            size="md"
            full-width
            @click="handleViewHistory"
          />
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
}

.dashboard__header {
  margin-bottom: var(--spacing-md);
}

.dashboard__progress {
  width: 100%;
}

.dashboard__preview {
  width: 100%;
}

.dashboard__start {
  width: 100%;
  margin-top: var(--spacing-md);
}

.dashboard__nav {
  width: 100%;
  margin-top: var(--spacing-lg);
}

@media (min-width: 768px) {
  .dashboard {
    gap: var(--spacing-2xl);
    padding: var(--spacing-xl) 0;
  }
}
</style>

