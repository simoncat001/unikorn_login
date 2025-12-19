<template>
  <ContentObject
    v-if="type === 'object'"
    :content="(content as DataContent[]) || []"
    :order="order"
  />
  <ContentArray
    v-else-if="type === 'array'"
    :parent-title="parentTitle"
    :element-meta="elementType"
    :content-list="Array.isArray(content) ? (content as unknown[]) : []"
    :unit="elementType?.unit || unit"
  />
  <ContentString
    v-else-if="type === 'enum_text'"
    :content="getEnumText((content as string[]) || [])"
  />
  <ContentString
    v-else-if="type === 'number_range'"
    :content="getNumberRange((content as NumberRange) || { start: '', end: '' }, unit)"
  />
  <ContentString
    v-else-if="type === 'number'"
    :content="getNumber(content as string | number, unit)"
  />
  <ContentString
    v-else-if="type === 'MGID'"
    :content="(content as string) || ''"
    :is-u-r-l="true"
  />
  <ContentString
    v-else-if="type === 'string'"
    :content="(content as string) || ''"
  />
  <ContentString
    v-else-if="type === 'date'"
    :content="(content as string) || ''"
  />
  <ContentFile
    v-else-if="type === 'file' || type === 'image'"
    :file="(content as UserFile) || { name: '', sha256: '' }"
  />
  <ContentString
    v-else
    :content="fallbackStringify(content)"
  />
</template>

<script setup lang="ts">
import type { DataContent, ElementType, NumberRange, UserFile } from '@/api/DevelopmentDataService';
import { getEnumText, getNumberRange, getNumber, fallbackStringify } from '@/utils/data-render-utils';
import ContentString from './ContentString.vue';
import ContentFile from './ContentFile.vue';
// Circular dependencies
import ContentObject from './ContentObject.vue';
import ContentArray from './ContentArray.vue';

defineProps<{
  type: string;
  content: any; // DataContent["content"]
  elementType?: ElementType;
  unit?: string;
  order?: ElementType[];
  parentTitle: string;
}>();
</script>
