<template>
  <ContentObject
    v-if="elementMeta?.type === 'object'"
    :content="Array.isArray(value) ? (value as DataContent[]) : []"
    :order="elementMeta.order"
  />
  <ContentObject
    v-else-if="!elementMeta && isObjectArray(value)"
    :content="value as DataContent[]"
  />
  <ContentArray
    v-else-if="elementMeta?.type === 'array'"
    :parent-title="elementMeta.title || ''"
    :element-meta="elementMeta.element_type"
    :content-list="Array.isArray(value) ? (value as unknown[]) : []"
    :unit="elementMeta.unit || unit"
  />
  <ContentString
    v-else-if="elementMeta?.type === 'enum_text'"
    :content="getEnumText((value as string[]) || [])"
  />
  <ContentString
    v-else-if="elementMeta?.type === 'number_range'"
    :content="getNumberRange((value as NumberRange) || { start: '', end: '' }, elementMeta.unit || unit)"
  />
  <ContentString
    v-else-if="elementMeta?.type === 'number'"
    :content="getNumber(value as string | number, elementMeta.unit || unit)"
  />
  <ContentString
    v-else-if="elementMeta?.type === 'MGID'"
    :content="(value as string) || ''"
    :is-u-r-l="true"
  />
  <ContentFile
    v-else-if="elementMeta?.type === 'file' || elementMeta?.type === 'image'"
    :file="(value as UserFile) || { name: '', sha256: '' }"
  />
  <ContentString
    v-else-if="elementMeta?.type === 'date' || elementMeta?.type === 'string'"
    :content="fallbackStringify(value)"
  />
  <ContentString
    v-else
    :content="fallbackStringify(value)"
  />
</template>

<script setup lang="ts">
import type { DataContent, ElementType, NumberRange, UserFile } from '@/api/DevelopmentDataService';
import { getEnumText, getNumberRange, getNumber, fallbackStringify } from '@/utils/data-render-utils';
import ContentString from './ContentString.vue';
import ContentFile from './ContentFile.vue';
import ContentObject from './ContentObject.vue';
import ContentArray from './ContentArray.vue';

defineProps<{
  value: unknown;
  elementMeta?: ElementType;
  unit?: string;
}>();

const isObjectArray = (val: unknown): boolean => {
  return Array.isArray(val) && val.every(
    (child) => typeof child === "object" && child !== null && "title" in (child as Record<string, unknown>)
  );
};
</script>
