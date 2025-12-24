<template>
  <div class="object-container">
    <div
      v-for="(item, index) in normalizedContent"
      :key="item.title + index"
      class="object-row"
    >
      <ContentTitle :title="item.title" />
      <ContentItem
        :type="item.type"
        :content="item.content"
        :element-type="item.element_type ?? findMeta(item.title)?.element_type"
        :unit="item.unit ?? findMeta(item.title)?.unit"
        :order="findMeta(item.title)?.order"
        :parent-title="item.title"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DataContent, ElementType } from '@/api/DevelopmentDataService';
import { normalizeObjectContent, findMetaByTitle } from '@/utils/data-render-utils';
import ContentTitle from './ContentTitle.vue';
import ContentItem from './ContentItem.vue';

const props = defineProps<{
  content: DataContent[];
  order?: ElementType[];
}>();

const normalizedContent = computed(() => normalizeObjectContent(props.content, props.order));

const findMeta = (title: string) => findMetaByTitle(props.order, title);
</script>

<style scoped>
.object-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.object-row {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}
</style>
