<template>
  <div v-if="!Array.isArray(contentList) || contentList.length === 0" class="content-block empty-block">
    <!-- Empty block -->
  </div>
  <div v-else class="array-container">
    <div
      v-for="(item, index) in contentList"
      :key="`${parentTitle}-${index}`"
      class="array-row"
    >
      <ContentTitle :title="getLabel(index)" />
      <ContentArrayValue
        :value="item"
        :element-meta="elementMeta"
        :unit="unit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ElementType } from '@/api/DevelopmentDataService';
import ContentTitle from './ContentTitle.vue';
import ContentArrayValue from './ContentArrayValue.vue';

const props = defineProps<{
  parentTitle: string;
  elementMeta?: ElementType;
  contentList: unknown[];
  unit?: string;
}>();

const getLabel = (index: number) => {
  const duplicateTitle =
    props.elementMeta?.title && props.elementMeta.title === props.parentTitle;
  
  if (duplicateTitle) {
    return `${props.parentTitle} (${index + 1})`;
  }
  
  return props.elementMeta?.title ||
    (props.contentList.length > 1
      ? `${props.parentTitle} (${index + 1})`
      : props.parentTitle);
};
</script>

<style scoped>
.content-block {
  display: flex;
  flex-grow: 1;
  padding: 16px;
  border: solid 0.5px #e0e0e0;
}

.empty-block {
  min-height: 56px; /* Approximate height of a row */
}

.array-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.array-row {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}
</style>
