<template>
  <div class="ordered-schema-list" :style="{ borderLeftWidth: depth > 0 ? '1px' : '0px' }">
    <div class="list-content">
      <div v-for="(item, index) in wordOrder" :key="item.title + depth + index">
        <template v-if="item.type === 'array' || item.type === 'object'">
          <SchemaItem
            :data-type="item.type"
            :title="item.title"
            :unit="item.unit"
          />
          <OrderedSchemaList
            v-if="getNestedSchema(item.title)"
            :schema="getNestedSchema(item.title)"
            :word-order="item.order || []"
            :depth="depth + 1"
          />
        </template>
        <template v-else>
          <SchemaItem
            :data-type="item.type"
            :title="item.title"
            :unit="item.unit"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LayeredWordOrder } from '@/api/TemplateService';
import SchemaItem from './SchemaItem.vue';

const props = defineProps<{
  wordOrder: LayeredWordOrder[];
  schema: any; // JSONSchema7
  depth: number;
}>();

const getNestedSchema = (title: string) => {
  if (props.schema.properties && props.schema.properties[title]) {
    return props.schema.properties[title];
  }
  if (props.schema.items) {
    return props.schema.items;
  }
  return null;
};
</script>

<style scoped>
.ordered-schema-list {
  border-left-style: solid;
  border-left-color: #9FB3C8; /* border */
}

.list-content {
  margin-left: 24px;
}
</style>
