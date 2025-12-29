<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

interface Props {
	duration: number; // Duration in seconds
	autoStart?: boolean;
	onComplete?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
	autoStart: false,
	onComplete: undefined,
});

const emit = defineEmits<{
	complete: [];
}>();

const currentDuration = ref(props.duration); // Adjustable duration
const timeRemaining = ref(props.duration);
const isRunning = ref(false); // Will be set to true when start() is called
const isComplete = ref(false); // Track if timer reached zero
const intervalId = ref<number | null>(null);

const minutes = computed(() => Math.floor(timeRemaining.value / 60));
const seconds = computed(() => timeRemaining.value % 60);

const progress = computed(() => {
	return (timeRemaining.value / currentDuration.value) * 100;
});

const timeDisplay = computed(() => {
	return `${minutes.value.toString().padStart(2, "0")}:${seconds.value
		.toString()
		.padStart(2, "0")}`;
});

function adjustDuration(seconds: number) {
	const newDuration = Math.max(15, Math.min(600, currentDuration.value + seconds));
	const difference = newDuration - currentDuration.value;
	currentDuration.value = newDuration;
	// If running, adjust timeRemaining accordingly
	if (isRunning.value) {
		timeRemaining.value = Math.max(0, timeRemaining.value + difference);
		// If we've extended the duration and timer was complete, restart it
		if (timeRemaining.value > 0 && intervalId.value === null) {
			tick();
		}
	} else {
		timeRemaining.value = newDuration;
	}
}

function start() {
	if (isRunning.value) return;
	isRunning.value = true;
	isComplete.value = false;
	timeRemaining.value = currentDuration.value;
	tick();
}

function stop() {
	isRunning.value = false;
	if (intervalId.value !== null) {
		clearInterval(intervalId.value);
		intervalId.value = null;
	}
}

function reset() {
	stop();
	timeRemaining.value = currentDuration.value;
	isComplete.value = false;
}

function tick() {
	if (intervalId.value !== null) {
		clearInterval(intervalId.value);
	}

	intervalId.value = window.setInterval(() => {
		if (timeRemaining.value > 0) {
			timeRemaining.value -= 1;
		} else {
			// Timer reached zero - stop but don't auto-complete
			stop();
			isComplete.value = true;
			// Vibration feedback
			if (navigator.vibrate) {
				navigator.vibrate([200, 100, 200]);
			}
		}
	}, 1000);
}

function complete() {
	stop();
	// Don't auto-emit complete - let user manually proceed
	// Just stop the timer and show completion state
	// Vibration feedback
	if (navigator.vibrate) {
		navigator.vibrate([200, 100, 200]);
	}
}

watch(
	() => props.duration,
	(newDuration) => {
		if (!isRunning.value) {
			currentDuration.value = newDuration;
			timeRemaining.value = newDuration;
		}
	},
);

onMounted(async () => {
	if (props.autoStart) {
		// Small delay to ensure component is fully rendered
		await nextTick();
		setTimeout(() => {
			start();
		}, 100);
	}
});

onUnmounted(() => {
	stop();
});

defineExpose({
	start,
	stop,
	reset,
	get isRunning() { return isRunning.value; },
	get isComplete() { return isComplete.value; },
});
</script>

<template>
  <div class="rest-timer">
    <div class="rest-timer__controls">
      <button 
        class="rest-timer__adjust-button" 
        @click="adjustDuration(-15)"
        :disabled="currentDuration <= 15"
      >
        -15 sec
      </button>
      <div class="rest-timer__display">
        <div class="rest-timer__time">{{ timeDisplay }}</div>
        <div class="rest-timer__label">Rest</div>
      </div>
      <button 
        class="rest-timer__adjust-button" 
        @click="adjustDuration(15)"
        :disabled="currentDuration >= 600"
      >
        +15 sec
      </button>
    </div>
    <div class="rest-timer__progress">
      <div
        class="rest-timer__progress-fill"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.rest-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.rest-timer__controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
  justify-content: center;
}

.rest-timer__adjust-button {
  min-width: 80px;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.rest-timer__adjust-button:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.rest-timer__adjust-button:active:not(:disabled) {
  transform: scale(0.95);
}

.rest-timer__adjust-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.rest-timer__display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
}

.rest-timer__time {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  color: var(--color-gold);
  text-shadow: 0 2px 8px var(--color-gold-light);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--letter-spacing-tight);
}

.rest-timer__label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rest-timer__progress {
  width: 100%;
  height: 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.rest-timer__progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-gold) 0%,
    var(--color-gold-hover) 100%
  );
  border-radius: var(--radius-full);
  transition: width 1s linear;
  box-shadow: 0 0 4px var(--color-gold-light);
}

.rest-timer__actions {
  margin-top: var(--spacing-sm);
}

.rest-timer__button {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-accent);
  color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.rest-timer__button:hover {
  background-color: var(--color-accent-hover);
  transform: scale(1.05);
}

.rest-timer__button:active {
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .rest-timer__time {
    font-size: var(--font-size-6xl);
  }
}
</style>

