<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">管理台</p>
        <h2>数据审核 #{{ id }}</h2>
        <p class="muted">查看开发数据的元信息与文件列表。</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button">驳回</button>
        <button class="primary" type="button">通过</button>
      </div>
    </header>

    <article class="section-card">
      <h3>数据概览</h3>
      <p>演示数据：从接口获取文件大小、格式与校验信息。</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id as string;
</script>
