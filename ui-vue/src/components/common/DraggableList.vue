<template>
  <div class="dnd-list" :data-testid="testId">
    <div
      v-for="(item, index) in items"
      :key="getKey(item, index)"
      class="dnd-row"
      :class="{ dragging: draggingIndex === index, 'drag-over': dragOverIndex === index }"
      draggable="true"
      @dragstart="onDragStart(index, $event)"
      @dragend="onDragEnd"
      @dragover.prevent="onDragOver(index)"
      @drop.prevent="onDrop(index)"
    >
      <div class="dnd-handle" title="拖拽排序">⋮⋮</div>
      <div class="dnd-content">
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type Props<T> = {
  items: T[];
  /** optional stable key getter */
  itemKey?: (item: T, index: number) => string | number;
  testId?: string;
};

const props = defineProps<Props<any>>();

const emit = defineEmits<{
  (e: 'update:items', items: any[]): void;
}>();

const draggingIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const getKey = (item: any, index: number) => {
  if (props.itemKey) return props.itemKey(item, index);
  return item?.id ?? item?.key ?? index;
};

const onDragStart = (index: number, e: DragEvent) => {
  draggingIndex.value = index;
  dragOverIndex.value = index;

  // required for Firefox
  e.dataTransfer?.setData('text/plain', String(index));
  e.dataTransfer?.setDragImage?.((e.currentTarget as HTMLElement), 10, 10);
  e.dataTransfer!.effectAllowed = 'move';
};

const onDragOver = (index: number) => {
  dragOverIndex.value = index;
};

const onDrop = (dropIndex: number) => {
  const from = draggingIndex.value;
  if (from === null || from === dropIndex) {
    onDragEnd();
    return;
  }

  const next = [...props.items];
  const [moved] = next.splice(from, 1);
  next.splice(dropIndex, 0, moved);

  emit('update:items', next);
  onDragEnd();
};

const onDragEnd = () => {
  draggingIndex.value = null;
  dragOverIndex.value = null;
};
</script>

<style scoped>
.dnd-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.dnd-handle {
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  color: #9ca3af;
}

.dnd-row.dragging {
  opacity: 0.6;
}

.dnd-row.drag-over .dnd-content {
  outline: 2px dashed rgba(59, 130, 246, 0.6);
  outline-offset: 4px;
}

.dnd-content {
  flex: 1;
}
</style>
