<script setup lang="ts">
import { RouterView } from "vue-router";
import InstallPrompt from "./components/common/InstallPrompt.vue";
import ErrorToast from "./components/common/ErrorToast.vue";
</script>

<template>
  <ErrorToast />
  <RouterView />
  <InstallPrompt />
</template>
