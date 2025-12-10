<template>
  <div>
    <h2 style="margin: 0 0 8px;">{{ title }}</h2>
    <p style="margin: 0 0 16px; color: #4b5563;" v-if="description">{{ description }}</p>

    <div class="card" style="margin-bottom: 16px;">
      <p style="margin: 0 0 12px; color: #6b7280;">当前路由：<strong>{{ route.fullPath }}</strong></p>
      <div v-if="Object.keys(route.params).length">
        <h3 style="margin: 0 0 8px;">动态参数</h3>
        <ul style="margin: 0; padding-left: 18px; color: #374151;">
          <li v-for="(value, key) in route.params" :key="key">{{ key }}: {{ value }}</li>
        </ul>
      </div>
      <div v-else style="color: #9ca3af;">该页面目前为占位内容，可在此实现具体业务逻辑。</div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

interface Props {
  title: string;
  description?: string;
}

defineProps<Props>();
const route = useRoute();
</script>
