<script setup lang="ts">
import BigButton from '../common/BigButton.vue';

const emit = defineEmits<{
  start: [];
}>();

function handleStart() {
  emit('start');
}
</script>

<template>
  <div class="start-workout-button">
    <BigButton
      label="START WORKOUT"
      variant="primary"
      size="lg"
      full-width
      @click="handleStart"
    />
  </div>
</template>

<style scoped>
.start-workout-button {
  width: 100%;
  padding: var(--spacing-lg) 0;
}
</style>

