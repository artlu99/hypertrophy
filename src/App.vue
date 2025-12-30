<script setup lang="ts">
import { RouterView } from "vue-router";
import InstallPrompt from "./components/common/InstallPrompt.vue";
import ErrorToast from "./components/common/ErrorToast.vue";
import { usePWAUpdate } from "./composables/usePWAUpdate";

// Initialize PWA update detection
usePWAUpdate();
</script>

<template>
  <ErrorToast />
  <RouterView />
  <InstallPrompt />
</template>
