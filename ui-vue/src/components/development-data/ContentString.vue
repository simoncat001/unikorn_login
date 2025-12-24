<template>
  <div class="content-block">
    <div class="content-text">
      <router-link
        v-if="isURL"
        :to="`/admin/mgid/${contentStr}`"
        class="link"
      >
        {{ contentStr }}
      </router-link>
      <span v-else>
        {{ contentStr }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: string | number | null | undefined;
  isURL?: boolean;
}>();

const contentStr = computed(() => 
  props.content === null || props.content === undefined ? "" : String(props.content)
);
</script>

<style scoped>
.content-block {
  display: flex;
  flex-grow: 1;
  padding: 16px;
  border: solid 0.5px #e0e0e0;
}

.content-text {
  word-break: break-all;
  font-weight: normal;
}

.link {
  color: #333;
  text-decoration: none;
}

.link:hover {
  color: #0052cc;
  text-decoration: none;
}
</style>
