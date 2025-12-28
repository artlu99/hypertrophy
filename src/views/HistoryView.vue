<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '../stores/workout';
import type { WorkoutSession } from '../types/workout';
import AppLayout from '../components/layout/AppLayout.vue';
import ScreenContainer from '../components/layout/ScreenContainer.vue';
import BigButton from '../components/common/BigButton.vue';
import WorkoutHistoryList from '../components/history/WorkoutHistoryList.vue';
import WorkoutDetail from '../components/history/WorkoutDetail.vue';

const router = useRouter();
const workoutStore = useWorkoutStore();

const selectedWorkout = ref<WorkoutSession | null>(null);

function handleBack() {
  router.push('/');
}

function handleWorkoutSelected(workout: WorkoutSession) {
  selectedWorkout.value = workout;
}

function handleCloseDetail() {
  selectedWorkout.value = null;
}

function handleGoToSettings() {
  router.push('/settings');
}
</script>

<template>
  <AppLayout show-header header-title="Workout History">
    <ScreenContainer>
      <div class="history-view">
        <div v-if="selectedWorkout" class="history-view__detail">
          <WorkoutDetail
            :workout="selectedWorkout"
            :exercises="workoutStore.exercises"
            :unit="workoutStore.unit"
            @close="handleCloseDetail"
          />
        </div>

        <div v-else class="history-view__list">
          <WorkoutHistoryList
            :workouts="workoutStore.workoutHistory"
            :unit="workoutStore.unit"
            @workout-selected="handleWorkoutSelected"
          />
        </div>

        <div class="history-view__actions">
          <BigButton
            label="Settings"
            variant="secondary"
            size="md"
            full-width
            @click="handleGoToSettings"
          />
          <BigButton
            label="Back to Dashboard"
            variant="secondary"
            size="md"
            full-width
            @click="handleBack"
          />
        </div>
      </div>
    </ScreenContainer>
  </AppLayout>
</template>

<style scoped>
.history-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: var(--spacing-xl);
}

.history-view__list,
.history-view__detail {
  flex: 1;
}

.history-view__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}
</style>


