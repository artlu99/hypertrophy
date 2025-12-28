<script setup lang="ts">
import { RouterView } from "vue-router";
import InstallPrompt from "./components/common/InstallPrompt.vue";
import OfflineIndicator from "./components/common/OfflineIndicator.vue";
</script>

<template>
  <OfflineIndicator />
  <RouterView />
  <InstallPrompt />
</template>
