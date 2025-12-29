<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useSwipe } from "../composables/useSwipe";
import BigButton from "../components/common/BigButton.vue";
import RepsAdjuster from "../components/common/RepsAdjuster.vue";
import WeightAdjuster from "../components/common/WeightAdjuster.vue";
import AppLayout from "../components/layout/AppLayout.vue";
import ScreenContainer from "../components/layout/ScreenContainer.vue";
import SlideDrawer from "../components/common/SlideDrawer.vue";
import { useWorkoutStore } from "../stores/workout";

const router = useRouter();
const workoutStore = useWorkoutStore();

// Drawer state
const drawerOpen = ref(false);
const selectedCategory = ref<'exercises' | 'unit' | 'backup' | 'program'>('exercises');

// Exercise carousel state
const currentExerciseIndex = ref(0);
const exerciseCarouselRef = ref<HTMLElement | null>(null);

const currentExercise = computed(() => exerciseSettings.value[currentExerciseIndex.value]);

const unit = ref(workoutStore.unit);
const exerciseSettings = ref(
  workoutStore.exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    trackingType: ex.trackingType || "weight",
    baseWeight: ex.baseWeight,
    baseReps: ex.baseReps,
    baseTime: ex.baseTime,
  })),
);

const hasChanges = computed(() => {
  if (unit.value !== workoutStore.unit) return true;
  return exerciseSettings.value.some((ex) => {
    const original = workoutStore.exercises.find((e) => e.id === ex.id);
    if (!original) return false;
    return (
      ex.baseWeight !== original.baseWeight ||
      ex.baseReps !== original.baseReps ||
      ex.baseTime !== original.baseTime
    );
  });
});

function handleUnitChange(newUnit: "kg" | "lbs") {
  unit.value = newUnit;
}

function handleWeightChange(exerciseId: number, weight: number) {
  const exercise = exerciseSettings.value.find((ex) => ex.id === exerciseId);
  if (exercise) {
    exercise.baseWeight = weight;
  }
}

function handleRepsChange(exerciseId: number, reps: number) {
  const exercise = exerciseSettings.value.find((ex) => ex.id === exerciseId);
  if (exercise) {
    exercise.baseReps = reps;
  }
}

function handleTimeChange(exerciseId: number, time: number) {
  const exercise = exerciseSettings.value.find((ex) => ex.id === exerciseId);
  if (exercise) {
    exercise.baseTime = time;
  }
}

function handleSave() {
  // Update unit
  if (unit.value !== workoutStore.unit) {
    workoutStore.updateUser(workoutStore.user.name, unit.value);
  }

  // Update exercise settings based on tracking type
  exerciseSettings.value.forEach((ex) => {
    const original = workoutStore.exercises.find((e) => e.id === ex.id);
    if (!original) return;

    if (ex.trackingType === "weight" && ex.baseWeight !== original.baseWeight) {
      workoutStore.updateExerciseBaseWeight(ex.id, ex.baseWeight);
    } else if (
      ex.trackingType === "reps" &&
      ex.baseReps !== original.baseReps
    ) {
      workoutStore.updateExerciseBaseReps(ex.id, ex.baseReps || 10);
    } else if (
      ex.trackingType === "time" &&
      ex.baseTime !== original.baseTime
    ) {
      workoutStore.updateExerciseBaseTime(ex.id, ex.baseTime || 30);
    }
  });

  router.push("/");
}

function handleReset() {
  if (
    confirm(
      "Are you sure you want to reset the program? This will reset all progress, workout history, and starting weights. This action cannot be undone.",
    )
  ) {
    workoutStore.resetProgram();
    // Reset local state
    unit.value = workoutStore.unit;
    exerciseSettings.value = workoutStore.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      trackingType: ex.trackingType || "weight",
      baseWeight: ex.baseWeight,
      baseReps: ex.baseReps,
      baseTime: ex.baseTime,
    }));
    router.push("/");
  }
}

function handleCancel() {
  router.push("/");
}

// Export/Import functionality
const importText = ref("");
const importError = ref<string | null>(null);
const importSuccess = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function handleExport() {
  try {
    const jsonData = workoutStore.exportData();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hypertrophy-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    importError.value = "Failed to export data. Please try again.";
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    importText.value = text;
    handleImport(text);
  };
  reader.onerror = () => {
    importError.value = "Failed to read file. Please try again.";
  };
  reader.readAsText(file);
}

function handleImportFromText() {
  if (!importText.value.trim()) {
    importError.value = "Please paste JSON data or select a file.";
    return;
  }
  handleImport(importText.value);
}

function handleImport(json: string) {
  importError.value = null;
  importSuccess.value = false;

  if (!json.trim()) {
    importError.value = "Please provide JSON data.";
    return;
  }

  const result = workoutStore.importData(json);
  if (result.success) {
    importSuccess.value = true;
    importText.value = "";
    // Reset file input
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
    // Reset local state to match imported data
    unit.value = workoutStore.unit;
    exerciseSettings.value = workoutStore.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      trackingType: ex.trackingType || "weight",
      baseWeight: ex.baseWeight,
      baseReps: ex.baseReps,
      baseTime: ex.baseTime,
    }));
    // Clear success message after 3 seconds
    setTimeout(() => {
      importSuccess.value = false;
    }, 3000);
  } else {
    importError.value = result.error || "Failed to import data.";
  }
}

// Swipe functionality for exercise carousel
useSwipe(exerciseCarouselRef, {
  onSwipeLeft: () => {
    if (currentExerciseIndex.value < exerciseSettings.value.length - 1) {
      currentExerciseIndex.value++;
    }
  },
  onSwipeRight: () => {
    if (currentExerciseIndex.value > 0) {
      currentExerciseIndex.value--;
    }
  },
  threshold: 50,
  velocity: 0.3,
});

function selectCategory(category: 'exercises' | 'unit' | 'backup' | 'program') {
  selectedCategory.value = category;
  drawerOpen.value = false;
}

// Reset local state if user navigates away without saving
watch(
  () => router.currentRoute.value.path,
  () => {
    if (router.currentRoute.value.path !== "/settings") {
      unit.value = workoutStore.unit;
      exerciseSettings.value = workoutStore.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        trackingType: ex.trackingType || "weight",
        baseWeight: ex.baseWeight,
        baseReps: ex.baseReps,
        baseTime: ex.baseTime,
      }));
    }
  },
);
</script>

<template>
  <AppLayout show-header header-title="Settings">
    <ScreenContainer>
      <div class="settings-view">
        <!-- Menu Button -->
        <div class="settings-view__menu">
          <BigButton
            label="☰ Menu"
            variant="secondary"
            size="md"
            full-width
            @click="drawerOpen = true"
          />
        </div>

        <!-- Unit Preference -->
        <div v-if="selectedCategory === 'unit'" class="settings-view__section">
          <h2 class="settings-view__section-title">Unit Preference</h2>
          <div class="settings-view__unit-toggle">
            <button :class="[
              'settings-view__unit-button',
              { 'settings-view__unit-button--active': unit === 'kg' },
            ]" @click="handleUnitChange('kg')">
              kg
            </button>
            <button :class="[
              'settings-view__unit-button',
              { 'settings-view__unit-button--active': unit === 'lbs' },
            ]" @click="handleUnitChange('lbs')">
              lbs
            </button>
          </div>
        </div>

        <!-- Exercise Settings - Horizontal Carousel -->
        <div v-if="selectedCategory === 'exercises'" class="settings-view__section settings-view__section--exercises">
          <div class="settings-view__exercise-header-bar">
            <button
              class="settings-view__exercise-nav"
              :disabled="currentExerciseIndex === 0"
              @click="currentExerciseIndex--"
              type="button"
            >
              ←
            </button>
            <div class="settings-view__exercise-counter">
              {{ currentExerciseIndex + 1 }} / {{ exerciseSettings.length }}
            </div>
            <button
              class="settings-view__exercise-nav"
              :disabled="currentExerciseIndex === exerciseSettings.length - 1"
              @click="currentExerciseIndex++"
              type="button"
            >
              →
            </button>
          </div>
          <div ref="exerciseCarouselRef" class="settings-view__exercises-carousel">
            <Transition name="exercise-slide" mode="out-in">
              <div
                v-if="currentExercise"
                :key="currentExercise.id"
                class="settings-view__exercise"
              >
                <div class="settings-view__exercise-header">
                  <h3 class="settings-view__exercise-name">{{ currentExercise?.name }}</h3>
                  <span class="settings-view__exercise-day">
                    {{workoutStore.exercises.find((e) => e.id === currentExercise?.id)?.workoutDay}}
                  </span>
                </div>

                <!-- Weight-based exercises -->
                <div v-if="currentExercise?.trackingType === 'weight'" class="settings-view__exercise-control">
                  <label class="settings-view__control-label">Starting Weight</label>
                  <WeightAdjuster :value="currentExercise?.baseWeight" :unit="unit" :min="0" :max="1000"
                    :step="unit === 'kg' ? 2.5 : 5" @update:value="(weight) => currentExercise && handleWeightChange(currentExercise.id, weight)" />
                </div>

                <!-- Reps-based exercises -->
                <div v-else-if="currentExercise?.trackingType === 'reps'" class="settings-view__exercise-control">
                  <label class="settings-view__control-label">Starting Reps</label>
                  <RepsAdjuster :value="currentExercise?.baseReps || 10" :min="1" :max="200" :step="1"
                    @update:value="(reps) => currentExercise && handleRepsChange(currentExercise.id, reps)" />
                </div>

                <!-- Time-based exercises -->
                <div v-else-if="currentExercise?.trackingType === 'time'" class="settings-view__exercise-control">
                  <label class="settings-view__control-label">Starting Time (seconds)</label>
                  <div class="settings-view__time-control">
                    <button class="settings-view__time-button"
                      @click="currentExercise && handleTimeChange(currentExercise.id, (currentExercise.baseTime || 30) - 5)"
                      :disabled="(currentExercise?.baseTime || 30) <= 5">
                      −5s
                    </button>
                    <span class="settings-view__time-display">
                      {{ Math.floor((currentExercise?.baseTime || 30) / 60) }}:{{ ((currentExercise?.baseTime || 30) %
                        60).toString().padStart(2, '0') }}
                    </span>
                    <button class="settings-view__time-button"
                      @click="currentExercise && handleTimeChange(currentExercise.id, (currentExercise.baseTime || 30) + 5)"
                      :disabled="(currentExercise?.baseTime || 30) >= 600">
                      +5s
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Backup & Restore -->
        <div v-if="selectedCategory === 'backup'" class="settings-view__section">
          <h2 class="settings-view__section-title">Data Backup & Restore</h2>
          <p class="settings-view__section-description">
            Export your workout data as JSON to save on your phone, or import previously exported data.
          </p>

          <div class="settings-view__backup-actions">
            <BigButton label="Export Data" variant="primary" size="md" full-width @click="handleExport" />
            <p class="settings-view__backup-hint">
              Downloads a JSON file with all your workout history, progress, and settings.
            </p>
          </div>

          <div class="settings-view__import-section">
            <h3 class="settings-view__import-title">Import Data</h3>
            <div class="settings-view__import-file">
              <input ref="fileInputRef" type="file" accept=".json,application/json" class="settings-view__file-input"
                @change="handleFileSelect" />
              <BigButton label="Choose File" variant="secondary" size="sm" @click="() => fileInputRef?.click()" />
            </div>
            <div class="settings-view__import-divider">
              <span>or</span>
            </div>
            <div class="settings-view__import-text">
              <textarea v-model="importText" class="settings-view__textarea" placeholder="Paste JSON data here..."
                rows="6" />
              <BigButton label="Import from Text" variant="secondary" size="md" full-width
                @click="handleImportFromText" />
            </div>

            <div v-if="importError" class="settings-view__error-message">
              <span class="settings-view__error-icon">⚠️</span>
              <span>{{ importError }}</span>
              <button class="settings-view__error-close" @click="importError = null" aria-label="Dismiss error"
                type="button">
                ×
              </button>
            </div>

            <div v-if="importSuccess" class="settings-view__success-message">
              ✓ Data imported successfully!
            </div>
          </div>
        </div>

        <!-- Program Management -->
        <div v-if="selectedCategory === 'program'" class="settings-view__section">
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
          <BigButton label="Reset Program" variant="danger" size="md" full-width @click="handleReset" />
          <p class="settings-view__warning">
            ⚠️ Resetting will clear all workout history and reset progress to week 1, day A.
          </p>
        </div>

        <div class="settings-view__actions">
          <BigButton label="Save Changes" variant="primary" size="lg" full-width :disabled="!hasChanges"
            @click="handleSave" />
          <BigButton label="Cancel" variant="secondary" size="md" full-width @click="handleCancel" />
        </div>
      </div>

      <!-- Drawer -->
      <SlideDrawer v-model="drawerOpen" side="left">
        <div class="settings-view__drawer-content">
          <h2 class="settings-view__drawer-title">Settings</h2>
          <div class="settings-view__drawer-menu">
            <button
              :class="['settings-view__drawer-item', { 'settings-view__drawer-item--active': selectedCategory === 'exercises' }]"
              @click="selectCategory('exercises')"
              type="button"
            >
              💪 Exercises
            </button>
            <button
              :class="['settings-view__drawer-item', { 'settings-view__drawer-item--active': selectedCategory === 'unit' }]"
              @click="selectCategory('unit')"
              type="button"
            >
              ⚖️ Unit Preference
            </button>
            <button
              :class="['settings-view__drawer-item', { 'settings-view__drawer-item--active': selectedCategory === 'backup' }]"
              @click="selectCategory('backup')"
              type="button"
            >
              💾 Backup & Restore
            </button>
            <button
              :class="['settings-view__drawer-item', { 'settings-view__drawer-item--active': selectedCategory === 'program' }]"
              @click="selectCategory('program')"
              type="button"
            >
              🔄 Program Management
            </button>
          </div>
        </div>
      </SlideDrawer>
    </ScreenContainer>
  </AppLayout>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.settings-view__menu {
  flex-shrink: 0;
}

.settings-view__section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.settings-view__section--exercises {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow: hidden;
}

.settings-view__section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  flex-shrink: 0;
}

.settings-view__section-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
  flex-shrink: 0;
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

.settings-view__exercise-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.settings-view__exercise-nav {
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.settings-view__exercise-nav:not(:disabled):hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
}

.settings-view__exercise-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.settings-view__exercise-counter {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.settings-view__exercises-carousel {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
}

.settings-view__exercises {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
}

.settings-view__exercise {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  height: 100%;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.settings-view__exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-view__exercise-name {
  font-size: var(--font-size-base);
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

.settings-view__backup-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.settings-view__backup-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

.settings-view__import-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.settings-view__import-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.settings-view__import-file {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.settings-view__file-input {
  display: none;
}

.settings-view__import-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: var(--spacing-sm) 0;
}

.settings-view__import-divider::before,
.settings-view__import-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--color-border);
}

.settings-view__import-divider span {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  padding: 0 var(--spacing-sm);
}

.settings-view__import-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-view__textarea {
  width: 100%;
  min-height: 120px;
  padding: var(--spacing-md);
  font-family: var(--font-family-mono, 'Courier New', monospace);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
  -webkit-tap-highlight-color: transparent;
}

.settings-view__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb, 255, 215, 0), 0.2);
}

.settings-view__error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.settings-view__error-icon {
  flex-shrink: 0;
  font-size: var(--font-size-lg);
}

.settings-view__exercise-control {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-view__control-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.settings-view__time-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
}

.settings-view__time-button {
  min-width: 60px;
  min-height: 48px;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.settings-view__time-button:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.settings-view__time-button:active:not(:disabled) {
  transform: scale(0.95);
}

.settings-view__time-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.settings-view__time-display {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  min-width: 80px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.settings-view__error-close {
  margin-left: auto;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-error);
  font-size: var(--font-size-xl);
  line-height: 1;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.settings-view__error-close:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

.settings-view__success-message {
  padding: var(--spacing-md);
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.settings-view__actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.settings-view__drawer-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.settings-view__drawer-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.settings-view__drawer-menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.settings-view__drawer-item {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.settings-view__drawer-item:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-accent);
}

.settings-view__drawer-item--active {
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border-color: var(--color-accent);
}

.exercise-slide-enter-active,
.exercise-slide-leave-active {
  transition: all 0.3s ease;
}

.exercise-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.exercise-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
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
