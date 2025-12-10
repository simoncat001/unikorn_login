<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">公开数据</p>
        <h2>{{ data.title }}</h2>
        <p class="muted">无需登录即可访问的公共数据集。</p>
      </div>
      <button class="secondary" type="button">立即下载</button>
    </header>

    <article class="section-card">
      <h3>简介</h3>
      <p>{{ data.description }}</p>
      <p class="muted">发布者：{{ data.owner }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const data = computed(() => ({
  id: route.params.id as string,
  title: `公开数据集 #${route.params.id}`,
  owner: "公开贡献者",
  description: "演示数据：公开访问的开发数据详情。"
}));
</script>
