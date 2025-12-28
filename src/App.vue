<script setup lang="ts">
import { RouterView } from "vue-router";
import InstallPrompt from "./components/common/InstallPrompt.vue";
import OfflineIndicator from "./components/common/OfflineIndicator.vue";
import ErrorToast from "./components/common/ErrorToast.vue";
</script>

<template>
  <OfflineIndicator />
  <ErrorToast />
  <RouterView />
  <InstallPrompt />
</template>
