<template>
  <div class="card">
    <div class="card-header">
      <div class="title-section">
        <h3 class="title" v-html="highlight(item.json_data.template_name)"></h3>
      </div>
      <div class="status-section">
        <span class="status-badge">{{ item.json_data.review_status }}</span>
      </div>
    </div>
    <div class="card-content">
      <div class="info-row">
        <span class="label">作者:</span>
        <span class="value">{{ item.json_data.author }}</span>
      </div>
      <div class="info-row">
        <span class="label">机构:</span>
        <span class="value">{{ item.json_data.institution }}</span>
      </div>
    </div>
    <div class="card-actions">
      <router-link :to="`/data/detail/${item.id}`" class="action-button">查看详情</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { DevelopmentData } from '../../api/DevelopmentDataService';

const props = defineProps<{
  item: DevelopmentData;
  query: string;
  loggedIn: boolean;
}>();

const highlight = (text: string) => {
  if (!props.query || !text) return text;
  const regex = new RegExp(`(${props.query})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};
</script>

<style scoped>
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.status-badge {
  padding: 4px 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
}

.card-content {
  margin-bottom: 16px;
}

.info-row {
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  color: #6b7280;
  margin-right: 8px;
}

.value {
  color: #374151;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.action-button {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.action-button:hover {
  text-decoration: underline;
}

:deep(.highlight) {
  color: #ef4444;
  font-weight: bold;
}
</style>
