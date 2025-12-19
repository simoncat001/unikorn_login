<template>
  <div class="preset-words-container">
    <div v-if="currentPresetWords.length === 0" class="no-preset">
      暂无预定义字段
    </div>
    <div v-else v-for="(word, index) in currentPresetWords" :key="index" class="preset-card">
      <div class="preset-content">
        <span class="preset-name">{{ word.name }}</span>
        <span class="preset-type">{{ word.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  presetWordList: Record<string, string[]>;
  templateType: string;
}>();

const currentPresetWords = computed(() => {
  const rawList = props.presetWordList[props.templateType] || [];
  return rawList.map(wordStr => {
    const parts = wordStr.split(':');
    if (parts.length < 3) return { name: wordStr, type: '' };
    const type = parts[parts.length - 2];
    const name = parts.slice(0, parts.length - 2).join(':');
    return { name, type };
  });
});
</script>

<style scoped>
.preset-words-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 30px;
}

.preset-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
}

.preset-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.preset-name {
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.preset-type {
  color: #666;
  font-size: 13px;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.no-preset {
  text-align: center;
  color: #999;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>