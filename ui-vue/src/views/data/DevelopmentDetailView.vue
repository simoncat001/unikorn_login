<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">开发数据详情</p>
        <h2>{{ data.title }}</h2>
        <p class="muted">{{ data.domain }} · {{ data.visibility === "public" ? "公开" : "私有" }}</p>
      </div>
      <button class="primary" type="button">申请下载</button>
    </header>

    <article class="section-card">
      <h3>简介</h3>
      <p>{{ data.description }}</p>
      <ul class="list">
        <li>校验：{{ data.checksum }} ({{ data.checksumValue }})</li>
        <li>创建时间：{{ data.createdAt }}</li>
        <li>更新时间：{{ data.updatedAt }}</li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const data = computed(() => ({
  id: route.params.id as string,
  title: `数据集 #${route.params.id}`,
  domain: "NLP",
  visibility: "public",
  description: "演示数据：这里展示数据集的详细介绍、大小与下载方式。",
  checksum: "MD5",
  checksumValue: "12345",
  createdAt: "2024-01-01",
  updatedAt: "2024-05-01"
}));
</script>
