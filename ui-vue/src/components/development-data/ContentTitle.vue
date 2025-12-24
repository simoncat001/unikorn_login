<template>
  <div class="title-block">
    <div class="title-text">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped>
.title-block {
  background-color: #f5f5f5; /* accentBackground approximation */
  border: solid 0.5px #e0e0e0; /* lighterBorder approximation */
  min-width: 120px;
  max-width: 120px;
  padding: 16px;
  display: flex;
}

.title-text {
  font-weight: bold;
}
</style>
