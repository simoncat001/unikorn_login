<template>
  <div class="template-editor">
    <DraggableList :items="items" @update:items="newItems => emit('update:items', newItems)">
      <template #default="{ item, index }">
        <div class="editor-item">
          <div class="item-header">
            <div class="item-controls">
          <!-- Type Selector -->
          <div class="control-group">
            <label class="control-label">类型:</label>
            <select 
              :value="item[keys.type]" 
              @change="e => updateType(index, (e.target as HTMLSelectElement).value as any)"
              class="form-select-styled"
              :disabled="level >= maxLevel"
            >
              <option value="single">单元素</option>
              <option value="vocabulary">词汇 (Vocabulary)</option>
              <option v-if="level < maxLevel" value="array">数组型</option>
              <option v-if="level < maxLevel" value="object">对象型</option>
            </select>
          </div>

          <!-- Attribute/Data Type Selector (Only for Single) -->
          <div v-if="item[keys.type] === 'single'" class="control-group">
            <label class="control-label">属性:</label>
            <select 
              :value="getSingleType(item)" 
              @change="e => updateSingleType(index, (e.target as HTMLSelectElement).value)"
              class="form-select-styled"
            >
              <option value="string">文本 (String)</option>
              <option value="integer">整数 (Integer)</option>
              <option value="number">小数 (Decimal)</option>
              <option value="boolean">布尔 (Boolean)</option>
              <option value="date">日期 (Date)</option>
              <option value="integer_range">整数范围 (Integer Range)</option>
              <option value="decimal_range">小数范围 (Decimal Range)</option>
            </select>

            <!-- Unit Input (Only for numeric single types) -->
            <div
              v-if="isNumericSingleType(getSingleType(item))"
              class="unit-input"
              style="margin-left: 8px;"
            >
              <label class="control-label">单位:</label>
              <input
                :value="getSingleUnit(item)"
                @input="e => updateSingleUnit(index, (e.target as HTMLInputElement).value)"
                type="text"
                class="form-input-styled unit-input-field"
                placeholder="单位"
              />
            </div>

            <!-- Range Inputs (Inline) -->
            <div 
              v-if="getSingleType(item) === 'integer_range' || getSingleType(item) === 'decimal_range'" 
              class="range-inputs"
              style="margin-left: 8px;"
            >
              <input 
                :value="getSingleMin(item)"
                @input="e => updateSingleMin(index, (e.target as HTMLInputElement).value)"
                type="number" 
                class="form-input-styled range-input"
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <input 
                :value="getSingleMax(item)"
                @input="e => updateSingleMax(index, (e.target as HTMLInputElement).value)"
                type="number" 
                class="form-input-styled range-input"
                placeholder="最大值"
              />
            </div>
          </div>

          <!-- Vocabulary Search (Only for Vocabulary Type) -->
          <div v-if="item[keys.type] === 'vocabulary'" class="control-group vocabulary-group">
            <div class="vocabulary-search-container">
              <div class="search-input-wrapper">
                <label class="control-label">选择词汇:</label>
                <div class="vocabulary-search" style="position: relative;">
                  <input 
                    :value="getVocabularyName(item)"
                    @input="e => handleVocabularySearch(index, (e.target as HTMLInputElement).value)"
                    type="text" 
                    class="form-input-styled"
                    placeholder="搜索词汇..."
                  />
                  <div v-if="activeSearchIndex === index && vocabularySearchResults.length > 0" class="search-results">
                    <div 
                      v-for="word in vocabularySearchResults" 
                      :key="word.id"
                      class="search-result-item"
                      @click="selectVocabulary(index, word)"
                    >
                      {{ word.json_data.chinese_name }} ({{ word.json_data.english_name }})
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Vocabulary Details Display -->
              <div v-if="getVocabularyDetails(item)" class="vocabulary-details">
                <div class="vocabulary-detail-row">
                  <span><span class="detail-label">中文名:</span> {{ getVocabularyDetails(item).chinese_name }}</span>
                  <span><span class="detail-label">英文名:</span> {{ getVocabularyDetails(item).english_name }}</span>
                  <span><span class="detail-label">缩写:</span> {{ getVocabularyDetails(item).abbr }}</span>
                </div>
                <div class="vocabulary-detail-row">
                  <span><span class="detail-label">定义:</span> {{ getVocabularyDetails(item).definition }}</span>
                </div>
                <div class="vocabulary-detail-row">
                  <span><span class="detail-label">数据类型:</span> {{ getVocabularyDetails(item).data_type }}</span>
                  <span v-if="getVocabularyDetails(item).unit"><span class="detail-label">单位:</span> {{ getVocabularyDetails(item).unit }}</span>
                  <span v-if="getVocabularyDetails(item).number_range"><span class="detail-label">范围:</span> {{ getVocabularyDetails(item).number_range }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Name Input -->
          <div class="control-group name-group">
            <label class="control-label">名称:</label>
            <input 
              :value="getName(item)"
              @input="e => updateName(index, (e.target as HTMLInputElement).value)"
              type="text" 
              class="form-input-styled"
              placeholder="请输入名称"
            />
          </div>



          <!-- Required Checkbox (Only for Single and Array) -->
          <div v-if="item[keys.type] !== 'object'" class="control-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                :checked="getRequired(item)"
                @change="e => updateRequired(index, (e.target as HTMLInputElement).checked)"
              />
              必选
            </label>
          </div>

          <!-- Delete Button -->
          <button type="button" class="btn-delete" @click="removeItem(index)">
            ×
          </button>
            </div>
          </div>

      <!-- Recursive Children -->
          <div v-if="item[keys.type] !== 'single' && item[keys.type] !== 'vocabulary'" class="item-children">
            <div class="children-indent">
              <TemplateEditor 
                :level="level + 1"
                :items="getChildrenItems(item)"
                :max-level="maxLevel"
                @update:items="newItems => updateChildrenItems(index, newItems)"
              />
            </div>
          </div>
        </div>
      </template>
    </DraggableList>

    <!-- Add Button -->
    <div class="add-button-wrapper" :style="addButtonIndentStyle">
      <button type="button" class="btn-add" @click="addItem">
        + 添加字段
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { getKeys, createEmptyItem } from '@/utils/templateUtils';
import searchResult from '@/api/SearchService';
import type { Word } from '@/api/WordService';
import DraggableList from '@/components/common/DraggableList.vue';

defineOptions({
  name: 'TemplateEditor'
});

const props = withDefaults(defineProps<{
  level: number;
  items: any[];
  maxLevel?: number;
}>(), {
  maxLevel: 10
});

const emit = defineEmits<{
  (e: 'update:items', items: any[]): void;
}>();

const INDENT_PER_LEVEL_PX = 24;

const addButtonIndentStyle = computed(() => {
  // Root level (level=0) no indent; deeper levels indent progressively.
  const indentLeft = Math.max(0, props.level) * INDENT_PER_LEVEL_PX;
  return {
    paddingLeft: `${indentLeft}px`
  } as const;
});

const keys = computed(() => getKeys(props.level));

const getName = (item: any) => {
  if (item[keys.value.type] === 'single') return item[keys.value.single];
  if (item[keys.value.type] === 'array') return item[keys.value.array];
  if (item[keys.value.type] === 'object') return item[keys.value.object];
  if (item[keys.value.type] === 'vocabulary') return item[keys.value.vocabulary];
  return '';
};

const updateName = (index: number, value: string) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  const type = item[keys.value.type];
  
  if (type === 'single') item[keys.value.single] = value;
  else if (type === 'array') item[keys.value.array] = value;
  else if (type === 'object') item[keys.value.object] = value;
  else if (type === 'vocabulary') item[keys.value.vocabulary] = value;
  
  newItems[index] = item;
  emit('update:items', newItems);
};

const getRequired = (item: any) => {
  if (item[keys.value.type] === 'single') return item[keys.value.singleRequired];
  if (item[keys.value.type] === 'array') return item[keys.value.arrayRequired];
  if (item[keys.value.type] === 'vocabulary') return item[keys.value.vocabularyRequired];
  return false;
};

const updateRequired = (index: number, value: boolean) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  const type = item[keys.value.type];
  
  if (type === 'single') item[keys.value.singleRequired] = value;
  else if (type === 'array') item[keys.value.arrayRequired] = value;
  else if (type === 'vocabulary') item[keys.value.vocabularyRequired] = value;
  
  newItems[index] = item;
  emit('update:items', newItems);
};

const getSingleType = (item: any) => {
  if (item[keys.value.type] === 'single') return item[keys.value.singleType] || 'string';
  return '';
};

const updateSingleType = (index: number, value: string) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  if (item[keys.value.type] === 'single') {
    item[keys.value.singleType] = value;
  }
  newItems[index] = item;
  emit('update:items', newItems);
};

const getSingleMin = (item: any) => {
  if (item[keys.value.type] === 'single') return item[keys.value.singleMin];
  return '';
};

const updateSingleMin = (index: number, value: string) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  if (item[keys.value.type] === 'single') {
    item[keys.value.singleMin] = value;
  }
  newItems[index] = item;
  emit('update:items', newItems);
};

const getSingleMax = (item: any) => {
  if (item[keys.value.type] === 'single') return item[keys.value.singleMax];
  return '';
};

const updateSingleMax = (index: number, value: string) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  if (item[keys.value.type] === 'single') {
    item[keys.value.singleMax] = value;
  }
  newItems[index] = item;
  emit('update:items', newItems);
};

const isNumericSingleType = (t: string) => {
  return t === 'integer' || t === 'number' || t === 'integer_range' || t === 'decimal_range';
};

const getSingleUnit = (item: any) => {
  if (item[keys.value.type] === 'single') return item[keys.value.singleUnit] || '';
  return '';
};

const updateSingleUnit = (index: number, value: string) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  if (item[keys.value.type] === 'single') {
    item[keys.value.singleUnit] = value;
  }
  newItems[index] = item;
  emit('update:items', newItems);
};

// Vocabulary Search Logic
const activeSearchIndex = ref<number | null>(null);
const vocabularySearchResults = ref<Word[]>([]);

const getVocabularyName = (item: any) => {
  if (item[keys.value.type] === 'vocabulary') return item[keys.value.vocabularyName];
  return '';
};

const handleVocabularySearch = async (index: number, query: string) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  if (item[keys.value.type] === 'vocabulary') {
    item[keys.value.vocabularyName] = query;
    item[keys.value.vocabularyId] = ''; // Clear ID on input change
  }
  newItems[index] = item;
  emit('update:items', newItems);

  activeSearchIndex.value = index;
  
  if (!query) {
    vocabularySearchResults.value = [];
    return;
  }

  try {
    const results = await searchResult.getQuery(query, ['word'], 0, 10);
    vocabularySearchResults.value = results.wordResultList || [];
  } catch (e) {
    console.error('Vocabulary search failed:', e);
    vocabularySearchResults.value = [];
  }
};

const getVocabularyDetails = (item: any) => {
  if (item[keys.value.type] === 'vocabulary') return item[keys.value.vocabularyDetails];
  return null;
};

const selectVocabulary = (index: number, word: Word) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  if (item[keys.value.type] === 'vocabulary') {
    item[keys.value.vocabularyId] = word.id;
    item[keys.value.vocabularyName] = word.json_data.chinese_name;
    item[keys.value.vocabularyDetails] = word.json_data;
    
    // Auto-fill name if empty
    if (!item[keys.value.vocabulary]) {
      item[keys.value.vocabulary] = word.json_data.english_name;
    }
  }
  newItems[index] = item;
  emit('update:items', newItems);
  
  activeSearchIndex.value = null;
  vocabularySearchResults.value = [];
};

const updateType = (index: number, type: 'single' | 'array' | 'object' | 'vocabulary') => {
  const newItems = [...props.items];
  // Re-create item to reset structure for new type
  // Preserve name if possible? Maybe not, structure changes too much.
  // Let's just create new.
  newItems[index] = createEmptyItem(props.level, type);
  emit('update:items', newItems);
};

const getChildrenItems = (item: any) => {
  const nextKeys = getKeys(props.level + 1);
  const type = item[keys.value.type];
  if (type === 'array') {
    return item[keys.value.arrayItems]?.[nextKeys.levelArray] || [];
  } else if (type === 'object') {
    return item[keys.value.objectItems]?.[nextKeys.levelArray] || [];
  }
  return [];
};

const updateChildrenItems = (index: number, children: any[]) => {
  const newItems = [...props.items];
  const item = { ...newItems[index] };
  const type = item[keys.value.type];
  const nextKeys = getKeys(props.level + 1);
  
  if (type === 'array') {
    item[keys.value.arrayItems] = { ...item[keys.value.arrayItems], [nextKeys.levelArray]: children };
  } else if (type === 'object') {
    item[keys.value.objectItems] = { ...item[keys.value.objectItems], [nextKeys.levelArray]: children };
  }
  
  newItems[index] = item;
  emit('update:items', newItems);
};

const addItem = () => {
  const newItems = [...props.items, createEmptyItem(props.level)];
  emit('update:items', newItems);
};

const removeItem = (index: number) => {
  const newItems = [...props.items];
  newItems.splice(index, 1);
  emit('update:items', newItems);
};
</script>

<style scoped>
.template-editor {
  width: 100%;
}

.editor-item {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 16px;
  padding: 16px;
}

.item-header {
  display: flex;
  align-items: center;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  flex-wrap: nowrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vocabulary-group {
  align-items: flex-start; /* Align to top for vocabulary details */
}

.vocabulary-search-container {
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-group {
  min-width: 200px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.range-input {
  width: 80px !important;
  text-align: center;
}

.unit-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-input-field {
  width: 120px !important;
}

.range-separator {
  color: #666;
}

.name-group {
  flex: 1;
}

.control-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.form-select-styled {
  width: 110px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
}

.form-input-styled {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

/* Make the name input visibly longer than selects */
.name-group {
  flex: 0 1 360px;
  max-width: 420px;
}

/* Keep name input width stable (don't collapse when row is too wide) */
.name-group .form-input-styled {
  min-width: 200px;
}

/* Keep vocab search a bit longer than selects but not as long as name */
.vocabulary-group .form-input-styled {
  width: 260px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-delete {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.btn-delete:hover {
  color: #f44336;
}

.item-children {
  margin-top: 16px;
  padding-left: 24px;
  border-left: 2px solid #f0f0f0;
}

.add-button-wrapper {
  display: flex;
  justify-content: flex-start;
  padding: 8px 0;
}

.btn-add {
  background: white;
  border: 1px dashed #3f51b5;
  color: #3f51b5;
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  width: 300px;
  max-width: 100%;
}

.btn-add:hover {
  background: rgba(63, 81, 181, 0.04);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.vocabulary-details {
  margin-top: 8px;
  padding: 8px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  color: #4b5563;
}

.vocabulary-detail-row {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.vocabulary-detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: #374151;
}
</style>