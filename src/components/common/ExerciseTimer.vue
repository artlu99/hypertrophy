<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  duration: number; // Duration in seconds
  autoStart?: boolean;
  onComplete?: () => void;
  showControls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoStart: false,
  onComplete: undefined,
  showControls: true,
});

const emit = defineEmits<{
  complete: [];
  'time-change': [time: number];
}>();

const timeElapsed = ref(0);
const isRunning = ref(props.autoStart);
const intervalId = ref<number | null>(null);

const minutes = computed(() => Math.floor(timeElapsed.value / 60));
const seconds = computed(() => timeElapsed.value % 60);

const timeDisplay = computed(() => {
  return `${minutes.value.toString().padStart(2, '0')}:${seconds.value
    .toString()
    .padStart(2, '0')}`;
});

const progress = computed(() => {
  if (props.duration === 0) return 0;
  return Math.min(100, (timeElapsed.value / props.duration) * 100);
});

const isComplete = computed(() => {
  return timeElapsed.value >= props.duration;
});

function start() {
  if (isRunning.value) return;
  isRunning.value = true;
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
  timeElapsed.value = 0;
}

function tick() {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }

  intervalId.value = window.setInterval(() => {
    if (timeElapsed.value < props.duration) {
      timeElapsed.value += 1;
    } else {
      complete();
    }
  }, 1000);
}

function complete() {
  stop();
  emit('complete');
  if (props.onComplete) {
    props.onComplete();
  }
  // Vibration feedback
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function adjustTime(amount: number) {
  const newTime = Math.max(0, Math.min(600, props.duration + amount));
  emit('time-change', newTime);
  
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }
}

watch(
  () => props.duration,
  (newDuration: number) => {
    if (!isRunning.value && timeElapsed.value === 0) {
      // Only reset if timer hasn't started
      reset();
    }
  }
);

onMounted(() => {
  if (props.autoStart) {
    start();
  }
});

onUnmounted(() => {
  stop();
});

defineExpose({
  start,
  stop,
  reset,
  timeElapsed,
});
</script>

<template>
  <div class="exercise-timer">
    <div class="exercise-timer__display">
      <div class="exercise-timer__time">{{ timeDisplay }}</div>
      <div class="exercise-timer__label">Hold Time</div>
    </div>
    
    <div v-if="showControls && !isRunning" class="exercise-timer__adjust">
      <button
        class="exercise-timer__adjust-button"
        @click="adjustTime(-5)"
        aria-label="Decrease by 5 seconds"
      >
        −5s
      </button>
      <span class="exercise-timer__target">{{ Math.floor(duration / 60) }}:{{ (duration % 60).toString().padStart(2, '0') }}</span>
      <button
        class="exercise-timer__adjust-button"
        @click="adjustTime(5)"
        aria-label="Increase by 5 seconds"
      >
        +5s
      </button>
    </div>
    
    <div class="exercise-timer__progress">
      <div
        class="exercise-timer__progress-fill"
        :class="{ 'exercise-timer__progress-fill--complete': isComplete }"
        :style="{ width: `${progress}%` }"
      />
    </div>
    
    <div v-if="showControls && !isRunning && timeElapsed === 0" class="exercise-timer__actions">
      <button class="exercise-timer__button" @click="start">Start Timer</button>
    </div>
  </div>
</template>

<style scoped>
.exercise-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.exercise-timer__display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.exercise-timer__time {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  color: var(--color-accent);
  text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  font-variant-numeric: tabular-nums;
}

.exercise-timer__label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exercise-timer__adjust {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md);
}

.exercise-timer__adjust-button {
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

.exercise-timer__adjust-button:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-accent);
  transform: scale(1.05);
}

.exercise-timer__adjust-button:active {
  transform: scale(0.95);
}

.exercise-timer__target {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  min-width: 80px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.exercise-timer__progress {
  width: 100%;
  height: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.exercise-timer__progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  border-radius: var(--radius-full);
  transition: width 1s linear;
}

.exercise-timer__progress-fill--complete {
  background: linear-gradient(
    90deg,
    var(--color-success) 0%,
    var(--color-success) 100%
  );
}

.exercise-timer__actions {
  margin-top: var(--spacing-sm);
}

.exercise-timer__button {
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

.exercise-timer__button:hover {
  background-color: var(--color-accent-hover);
  transform: scale(1.05);
}

.exercise-timer__button:active {
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .exercise-timer__time {
    font-size: var(--font-size-6xl);
  }
}
</style>

