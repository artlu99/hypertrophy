<script setup lang="ts">
import { computed, watch } from 'vue';

interface Props {
  modelValue: boolean;
  side?: 'left' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
  side: 'left',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function close() {
  isOpen.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-overlay">
      <div v-if="isOpen" class="slide-drawer__overlay" @click="close">
        <div
          :class="['slide-drawer', `slide-drawer--${side}`]"
          @click.stop
        >
          <div class="slide-drawer__header">
            <button
              class="slide-drawer__close"
              @click="close"
              aria-label="Close drawer"
              type="button"
            >
              ×
            </button>
          </div>
          <div class="slide-drawer__content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-drawer__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: stretch;
}

.slide-drawer {
  width: 280px;
  max-width: 85vw;
  background-color: var(--color-bg-primary);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.slide-drawer--left {
  margin-right: auto;
}

.slide-drawer--right {
  margin-left: auto;
}

.slide-drawer__header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.slide-drawer__close {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  line-height: 1;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.slide-drawer__close:hover {
  background-color: var(--color-bg-secondary);
}

.slide-drawer__close:active {
  background-color: var(--color-bg-tertiary);
}

.slide-drawer__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: var(--spacing-sm);
}

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity var(--transition-base);
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-overlay-enter-active .slide-drawer--left,
.drawer-overlay-leave-active .slide-drawer--left {
  transition: transform var(--transition-base);
}

.drawer-overlay-enter-from .slide-drawer--left,
.drawer-overlay-leave-to .slide-drawer--left {
  transform: translateX(-100%);
}

.drawer-overlay-enter-active .slide-drawer--right,
.drawer-overlay-leave-active .slide-drawer--right {
  transition: transform var(--transition-base);
}

.drawer-overlay-enter-from .slide-drawer--right,
.drawer-overlay-leave-to .slide-drawer--right {
  transform: translateX(100%);
}
</style>

