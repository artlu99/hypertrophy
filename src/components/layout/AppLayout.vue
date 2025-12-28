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
    <div class="app-layout__background"></div>
    <div class="app-layout__content">
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
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.app-layout__background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background-image: url('/ambitious-studio-rick-barrett-IXPKJcrOZCI-unsplash.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  /* Reduce saturation and add subtle blur for hazy effect */
  filter: saturate(0.3) blur(1px);
  /* Darken slightly for better text contrast */
  opacity: 0.4;
}

.app-layout__background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-primary);
  opacity: 0.7;
  z-index: 1;
}

.app-layout__content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.app-layout__header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  /* Add slight transparency to let background show through */
  background-color: rgba(26, 26, 26, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  /* Add slight transparency to let background show through */
  background-color: rgba(26, 26, 26, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@media (min-width: 768px) {
  .app-layout__header,
  .app-layout__footer {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
  
  .app-layout__title {
    font-size: var(--font-size-2xl);
  }
  
  /* Slightly less blur on larger screens for better image visibility */
  .app-layout__background {
    filter: saturate(0.4) blur(0.5px);
    opacity: 0.5;
  }
}
</style>

