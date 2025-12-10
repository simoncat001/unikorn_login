<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">词条详情</p>
        <h2>{{ word.title }}</h2>
        <p class="muted">标签：{{ word.tags.join(', ') }}</p>
      </div>
      <button class="secondary" type="button">下载附件</button>
    </header>

    <article class="section-card">
      <h3>描述</h3>
      <p>{{ word.description }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const word = computed(() => ({
  id: route.params.id as string,
  title: `词条 #${route.params.id}`,
  description: "演示数据：这里显示词条的具体解释、来源及相关参考。",
  tags: ["ml", "ai"]
}));
</script>
