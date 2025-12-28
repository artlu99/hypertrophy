<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

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

const timeRemaining = ref(props.duration);
const isRunning = ref(props.autoStart);
const intervalId = ref<number | null>(null);

const minutes = computed(() => Math.floor(timeRemaining.value / 60));
const seconds = computed(() => timeRemaining.value % 60);

const progress = computed(() => {
  return (timeRemaining.value / props.duration) * 100;
});

const timeDisplay = computed(() => {
  return `${minutes.value.toString().padStart(2, '0')}:${seconds.value
    .toString()
    .padStart(2, '0')}`;
});

function start() {
  if (isRunning.value) return;
  isRunning.value = true;
  timeRemaining.value = props.duration;
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
  timeRemaining.value = props.duration;
}

function tick() {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
  }

  intervalId.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value -= 1;
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

watch(
  () => props.duration,
  (newDuration) => {
    if (!isRunning.value) {
      timeRemaining.value = newDuration;
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
});
</script>

<template>
  <div class="rest-timer">
    <div class="rest-timer__display">
      <div class="rest-timer__time">{{ timeDisplay }}</div>
      <div class="rest-timer__label">Rest</div>
    </div>
    <div class="rest-timer__progress">
      <div
        class="rest-timer__progress-fill"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <div v-if="!isRunning && timeRemaining === duration" class="rest-timer__actions">
      <button class="rest-timer__button" @click="start">Start Rest</button>
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

.rest-timer__display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.rest-timer__time {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-extrabold);
  line-height: var(--line-height-tight);
  color: var(--color-accent);
  text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  font-variant-numeric: tabular-nums;
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
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  border-radius: var(--radius-full);
  transition: width 1s linear;
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

