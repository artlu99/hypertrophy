<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';
import ScreenContainer from '../components/layout/ScreenContainer.vue';
import BigButton from '../components/common/BigButton.vue';

const router = useRouter();

function handleBack() {
  router.push('/');
}
</script>

<template>
  <AppLayout show-header header-title="Workout History">
    <ScreenContainer>
      <div style="text-align: center; padding: 2rem;">
        <p style="margin-bottom: 2rem; color: var(--color-text-secondary);">
          Workout history view coming soon...
        </p>
        <BigButton label="Back to Dashboard" variant="secondary" @click="handleBack" />
      </div>
    </ScreenContainer>
  </AppLayout>
</template>

