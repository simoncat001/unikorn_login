<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">管理台</p>
        <h2>{{ title }}</h2>
        <p class="muted">根据 itemType 展示不同的审核或管理列表。</p>
      </div>
      <button class="primary" type="button">新建</button>
    </header>

    <article class="section-card">
      <h3>列表</h3>
      <div class="list">
        <div v-for="row in rows" :key="row.id" class="list-row">
          <div>
            <strong>{{ row.name }}</strong>
            <p class="muted">{{ row.description }}</p>
          </div>
          <span class="badge">{{ row.status }}</span>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const title = computed(() => {
  const mapping: Record<string, string> = {
    words: "词条管理",
    templates: "模板管理",
    data: "数据管理",
    user: "用户管理",
    country: "国家管理",
    MGID: "MGID 申请"
  };
  return mapping[route.params.itemType as string] || "管理台";
});

const rows = computed(() =>
  Array.from({ length: 3 }).map((_, idx) => ({
    id: idx,
    name: `${title.value} #${idx + 1}`,
    description: "演示数据：从接口获取分页列表。",
    status: idx % 2 === 0 ? "审核中" : "已发布"
  }))
);
</script>
