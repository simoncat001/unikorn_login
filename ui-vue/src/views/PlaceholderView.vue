<template>
  <PagePlaceholder :title="title" :description="description">
    <slot />
  </PagePlaceholder>
</template>

<script setup lang="ts">
import PagePlaceholder from "../components/PagePlaceholder.vue";

defineProps<{ title: string; description?: string }>();
</script>
