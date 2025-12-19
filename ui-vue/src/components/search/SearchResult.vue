<template>
  <div class="search-results">
    <div v-if="!isLoaded && isClicked" class="no-results">
      未搜索到相关结果...
    </div>
    <div v-else-if="isLoaded" class="results-list">
      <template v-for="(item, index) in resultMergedList" :key="index">
        <WordCard
          v-if="item.type === 'word'"
          :item="item.wordValue"
          :query="query"
          :loggedIn="isAuthed"
        />
        <TemplateCard
          v-else-if="item.type === 'template'"
          :item="item.templateValue"
          :query="query"
          :loggedIn="isAuthed"
        />
        <DataCard
          v-else-if="item.type === 'data'"
          :item="item.dataValue"
          :query="query"
          :loggedIn="isAuthed"
        />
        <MGIDCard
          v-else-if="item.type === 'MGID'"
          :item="item.MGIDValue"
          :query="query"
          :loggedIn="isAuthed"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import WordCard from './WordCard.vue';
import TemplateCard from './TemplateCard.vue';
import DataCard from './DataCard.vue';
import MGIDCard from './MGIDCard.vue';
import { Word } from '../../api/WordService';
import { Template } from '../../api/TemplateService';
import { DevelopmentData } from '../../api/DevelopmentDataService';
import { MGIDApply } from '../../api/MGIDApplyService';

// Define a union type for the merged list items
export type SortListElem = 
  | { type: 'word'; wordValue: Word }
  | { type: 'template'; templateValue: Template }
  | { type: 'data'; dataValue: DevelopmentData }
  | { type: 'MGID'; MGIDValue: MGIDApply };

const props = defineProps<{
  resultMergedList: SortListElem[];
  query: string;
  isLoaded: boolean;
  isClicked: boolean;
  isAuthed: boolean;
}>();
</script>

<style scoped>
.search-results {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.no-results {
  text-align: center;
  color: #6b7280;
  margin-top: 40px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
