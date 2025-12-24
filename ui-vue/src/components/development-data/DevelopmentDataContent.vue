<template>
  <ContentObject
    v-if="data"
    :content="data.data_content"
    :order="data.word_order"
  />
</template>

<script setup lang="ts">
import type { DevelopmentDataJSON } from '@/api/DevelopmentDataService';
import ContentObject from './ContentObject.vue';

defineProps<{
  data: DevelopmentDataJSON;
}>();
</script>
