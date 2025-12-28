<script setup lang="ts">
interface Props {
  showHeader?: boolean;
  headerTitle?: string;
}

withDefaults(defineProps<Props>(), {
  showHeader: false,
  headerTitle: '',
});
</script>

<template>
  <div class="app-layout">
    <header v-if="showHeader" class="app-layout__header">
      <h1 v-if="headerTitle" class="app-layout__title">{{ headerTitle }}</h1>
      <slot name="header" />
    </header>
    <main class="app-layout__main">
      <slot />
    </main>
    <footer v-if="$slots.footer" class="app-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.app-layout__header {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.app-layout__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
}

.app-layout__main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.app-layout__footer {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .app-layout__header,
  .app-layout__footer {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
  
  .app-layout__title {
    font-size: var(--font-size-2xl);
  }
}
</style>

