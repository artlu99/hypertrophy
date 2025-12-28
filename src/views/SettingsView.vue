<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutStore } from '../stores/workout';
import AppLayout from '../components/layout/AppLayout.vue';
import ScreenContainer from '../components/layout/ScreenContainer.vue';
import BigButton from '../components/common/BigButton.vue';
import WeightAdjuster from '../components/common/WeightAdjuster.vue';

const router = useRouter();
const workoutStore = useWorkoutStore();

const unit = ref(workoutStore.unit);
const exerciseWeights = ref(
  workoutStore.exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    baseWeight: ex.baseWeight,
  }))
);

const hasChanges = computed(() => {
  if (unit.value !== workoutStore.unit) return true;
  return exerciseWeights.value.some((ex) => {
    const original = workoutStore.exercises.find((e) => e.id === ex.id);
    return original && ex.baseWeight !== original.baseWeight;
  });
});

function handleUnitChange(newUnit: 'kg' | 'lbs') {
  unit.value = newUnit;
}

function handleWeightChange(exerciseId: number, weight: number) {
  const exercise = exerciseWeights.value.find((ex) => ex.id === exerciseId);
  if (exercise) {
    exercise.baseWeight = weight;
  }
}

function handleSave() {
  // Update unit
  if (unit.value !== workoutStore.unit) {
    workoutStore.updateUser(workoutStore.user.name, unit.value);
  }

  // Update base weights
  exerciseWeights.value.forEach((ex) => {
    workoutStore.updateExerciseBaseWeight(ex.id, ex.baseWeight);
  });

  router.push('/');
}

function handleReset() {
  if (
    confirm(
      'Are you sure you want to reset the program? This will reset all progress, workout history, and starting weights. This action cannot be undone.'
    )
  ) {
    workoutStore.resetProgram();
    // Reset local state
    unit.value = workoutStore.unit;
    exerciseWeights.value = workoutStore.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      baseWeight: ex.baseWeight,
    }));
    router.push('/');
  }
}

function handleCancel() {
  router.push('/');
}

// Reset local state if user navigates away without saving
watch(
  () => router.currentRoute.value.path,
  () => {
    if (router.currentRoute.value.path !== '/settings') {
      unit.value = workoutStore.unit;
      exerciseWeights.value = workoutStore.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        baseWeight: ex.baseWeight,
      }));
    }
  }
);
</script>

<template>
  <AppLayout show-header header-title="Settings">
    <ScreenContainer>
      <div class="settings-view">
        <div class="settings-view__section">
          <h2 class="settings-view__section-title">Unit Preference</h2>
          <div class="settings-view__unit-toggle">
            <button
              :class="[
                'settings-view__unit-button',
                { 'settings-view__unit-button--active': unit === 'kg' },
              ]"
              @click="handleUnitChange('kg')"
            >
              kg
            </button>
            <button
              :class="[
                'settings-view__unit-button',
                { 'settings-view__unit-button--active': unit === 'lbs' },
              ]"
              @click="handleUnitChange('lbs')"
            >
              lbs
            </button>
          </div>
        </div>

        <div class="settings-view__section">
          <h2 class="settings-view__section-title">Starting Weights</h2>
          <p class="settings-view__section-description">
            Set your starting weights for each exercise. These will be used as the base for
            progression calculations.
          </p>
          <div class="settings-view__exercises">
            <div
              v-for="exercise in exerciseWeights"
              :key="exercise.id"
              class="settings-view__exercise"
            >
              <div class="settings-view__exercise-header">
                <h3 class="settings-view__exercise-name">{{ exercise.name }}</h3>
                <span class="settings-view__exercise-day">
                  {{ workoutStore.exercises.find((e) => e.id === exercise.id)?.workoutDay }}
                </span>
              </div>
              <WeightAdjuster
                :value="exercise.baseWeight"
                :unit="unit"
                :min="0"
                :max="1000"
                :step="unit === 'kg' ? 2.5 : 5"
                @update:value="(weight) => handleWeightChange(exercise.id, weight)"
              />
            </div>
          </div>
        </div>

        <div class="settings-view__section">
          <h2 class="settings-view__section-title">Program Management</h2>
          <div class="settings-view__program-info">
            <div class="settings-view__program-stat">
              <span class="settings-view__program-stat-label">Current Week</span>
              <span class="settings-view__program-stat-value">
                {{ workoutStore.currentWeek }} / 12
              </span>
            </div>
            <div class="settings-view__program-stat">
              <span class="settings-view__program-stat-label">Workouts Completed</span>
              <span class="settings-view__program-stat-value">
                {{ workoutStore.workoutHistory.length }}
              </span>
            </div>
          </div>
          <BigButton
            label="Reset Program"
            variant="danger"
            size="md"
            full-width
            @click="handleReset"
          />
          <p class="settings-view__warning">
            ⚠️ Resetting will clear all workout history and reset progress to week 1, day A.
          </p>
        </div>

        <div class="settings-view__actions">
          <BigButton
            label="Save Changes"
            variant="primary"
            size="lg"
            full-width
            :disabled="!hasChanges"
            @click="handleSave"
          />
          <BigButton
            label="Cancel"
            variant="secondary"
            size="md"
            full-width
            @click="handleCancel"
          />
        </div>
      </div>
    </ScreenContainer>
  </AppLayout>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: var(--spacing-xl);
}

.settings-view__section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.settings-view__section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.settings-view__section-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.settings-view__unit-toggle {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 300px;
}

.settings-view__unit-button {
  flex: 1;
  min-height: 56px;
  padding: var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.settings-view__unit-button:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
}

.settings-view__unit-button--active {
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border-color: var(--color-accent);
}

.settings-view__exercises {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.settings-view__exercise {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.settings-view__exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-view__exercise-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.settings-view__exercise-day {
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.settings-view__program-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.settings-view__program-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.settings-view__program-stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.settings-view__program-stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gold);
}

.settings-view__warning {
  font-size: var(--font-size-sm);
  color: var(--color-warning);
  margin: var(--spacing-md) 0 0 0;
  text-align: center;
}

.settings-view__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

@media (min-width: 768px) {
  .settings-view__section {
    padding: var(--spacing-xl);
  }
  
  .settings-view__section-title {
    font-size: var(--font-size-2xl);
  }
}
</style>

