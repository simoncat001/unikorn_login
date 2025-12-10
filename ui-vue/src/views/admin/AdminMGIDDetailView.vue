<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">管理台</p>
        <h2>MGID 审核 #{{ detail.MGID }}</h2>
        <p class="muted">自定义字段：{{ detail.custom }}</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button">驳回</button>
        <button class="primary" type="button">通过</button>
      </div>
    </header>

    <article class="section-card">
      <h3>申请信息</h3>
      <p>申请人：{{ detail.applicant }}</p>
      <p>用途：{{ detail.purpose }}</p>
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
  applicant: "演示申请人",
  purpose: "演示用途"
}));
</script>
