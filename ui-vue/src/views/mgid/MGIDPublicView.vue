<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">MGID 分享</p>
        <h2>MGID #{{ detail.MGID }}</h2>
        <p class="muted">公开访问入口，可用于跨系统验证。</p>
      </div>
      <span class="badge">公开</span>
    </header>

    <article class="section-card">
      <h3>详情</h3>
      <p>自定义字段：{{ detail.custom }}</p>
      <p>状态：{{ detail.status }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const detail = computed(() => ({
  MGID: route.params.MGID as string,
  custom: route.params.custom as string,
  status: "公开可见"
}));
</script>
