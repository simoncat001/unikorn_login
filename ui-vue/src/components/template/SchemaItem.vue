<template>
  <div class="schema-item">
    <div class="item-header">
      <div class="data-type-badge">
        {{ dataTypeMap[dataType] || dataType }}
      </div>
      <div class="data-name">
        {{ title }}
        <span v-if="unit" class="header-unit">单位：{{ unit }}</span>
      </div>
    </div>
    <div class="item-content">
      <div v-if="isFile" class="file-box"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  dataType: string;
  title: string;
  unit?: string;
}>();

const dataTypeMap: { [key: string]: string } = {
  string: "字符串",
  number: "数值",
  image: "图片",
  file: "文件",
  date: "日期",
  number_range: "数值范围",
  enum_text: "枚举项",
  array: "数组",
  object: "对象",
  MGID: "MGID",
};

const isFile = computed(() => props.dataType === 'file' || props.dataType === 'image');
const isNumber = computed(() => props.dataType === 'number');
const isNumberRange = computed(() => props.dataType === 'number_range');

</script>

<style scoped>
.schema-item {
  margin-bottom: 10px;
}

.item-header {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.data-type-badge {
  background-color: #2680C2; /* primaryColor */
  color: white;
  padding: 4px 8px;
  font-size: 14px;
  min-width: 80px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-name {
  background-color: #F0F4F8; /* lightFill */
  border: 1px solid #9FB3C8; /* border */
  padding: 4px 12px;
  font-size: 14px;
  flex-grow: 1;
  color: #102A43; /* bodyText */
  display: flex;
  align-items: center;
}

.item-content {
  margin: 10px 8px;
}

.file-box {
  width: 100%;
  height: 40px;
  border: 1px dashed #9FB3C8;
  background-color: #F9F9F9;
}

.text-box {
  width: 100%;
  height: 32px;
  border: 1px solid #9FB3C8;
  background-color: white;
}

.number-box {
  display: flex;
  align-items: center;
}

.number-range-box {
  display: flex;
  align-items: center;
}

.range-start, .range-end {
  width: 100px;
}

.separator {
  margin: 0 12px;
}

.header-unit {
  margin-left: auto;
  font-size: 14px;
  color: #666;
}
</style>
