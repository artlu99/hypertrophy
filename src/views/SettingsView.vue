<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import BigButton from "../components/common/BigButton.vue";
import WeightAdjuster from "../components/common/WeightAdjuster.vue";
import AppLayout from "../components/layout/AppLayout.vue";
import ScreenContainer from "../components/layout/ScreenContainer.vue";
import { useWorkoutStore } from "../stores/workout";

const router = useRouter();
const workoutStore = useWorkoutStore();

const unit = ref(workoutStore.unit);
const exerciseWeights = ref(
	workoutStore.exercises.map((ex) => ({
		id: ex.id,
		name: ex.name,
		baseWeight: ex.baseWeight,
	})),
);

const hasChanges = computed(() => {
	if (unit.value !== workoutStore.unit) return true;
	return exerciseWeights.value.some((ex) => {
		const original = workoutStore.exercises.find((e) => e.id === ex.id);
		return original && ex.baseWeight !== original.baseWeight;
	});
});

function handleUnitChange(newUnit: "kg" | "lbs") {
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
		exerciseWeights.value = workoutStore.exercises.map((ex) => ({
			id: ex.id,
			name: ex.name,
			baseWeight: ex.baseWeight,
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
		exerciseWeights.value = workoutStore.exercises.map((ex) => ({
			id: ex.id,
			name: ex.name,
			baseWeight: ex.baseWeight,
		}));
		// Clear success message after 3 seconds
		setTimeout(() => {
			importSuccess.value = false;
		}, 3000);
	} else {
		importError.value = result.error || "Failed to import data.";
	}
}

// Reset local state if user navigates away without saving
watch(
	() => router.currentRoute.value.path,
	() => {
		if (router.currentRoute.value.path !== "/settings") {
			unit.value = workoutStore.unit;
			exerciseWeights.value = workoutStore.exercises.map((ex) => ({
				id: ex.id,
				name: ex.name,
				baseWeight: ex.baseWeight,
			}));
		}
	},
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
          <h2 class="settings-view__section-title">Data Backup & Restore</h2>
          <p class="settings-view__section-description">
            Export your workout data as JSON to save on your phone, or import previously exported data.
          </p>
          
          <div class="settings-view__backup-actions">
            <BigButton
              label="Export Data"
              variant="primary"
              size="md"
              full-width
              @click="handleExport"
            />
            <p class="settings-view__backup-hint">
              Downloads a JSON file with all your workout history, progress, and settings.
            </p>
          </div>

          <div class="settings-view__import-section">
            <h3 class="settings-view__import-title">Import Data</h3>
            <div class="settings-view__import-file">
              <input
                ref="fileInputRef"
                type="file"
                accept=".json,application/json"
                class="settings-view__file-input"
                @change="handleFileSelect"
              />
              <BigButton
                label="Choose File"
                variant="secondary"
                size="sm"
                @click="() => fileInputRef?.click()"
              />
            </div>
            <div class="settings-view__import-divider">
              <span>or</span>
            </div>
            <div class="settings-view__import-text">
              <textarea
                v-model="importText"
                class="settings-view__textarea"
                placeholder="Paste JSON data here..."
                rows="6"
              />
              <BigButton
                label="Import from Text"
                variant="secondary"
                size="md"
                full-width
                @click="handleImportFromText"
              />
            </div>
            
            <div v-if="importError" class="settings-view__error-message">
              <span class="settings-view__error-icon">⚠️</span>
              <span>{{ importError }}</span>
              <button
                class="settings-view__error-close"
                @click="importError = null"
                aria-label="Dismiss error"
                type="button"
              >
                ×
              </button>
            </div>
            
            <div v-if="importSuccess" class="settings-view__success-message">
              ✓ Data imported successfully!
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

