<script setup lang="ts">
interface Props {
  padding?: boolean;
  center?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: true,
  center: false,
});
</script>

<template>
  <div class="screen-container" :class="{ 'screen-container--center': center }">
    <slot />
  </div>
</template>

<style scoped>
.screen-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
}

.screen-container--center {
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .screen-container {
    padding: var(--spacing-xl);
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>

