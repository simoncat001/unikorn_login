<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">MGID</p>
        <h2>MGID #{{ detail.MGID }}</h2>
        <p class="muted">状态：{{ detail.status }}</p>
      </div>
      <button class="secondary" type="button">下载凭证</button>
    </header>

    <article class="section-card">
      <h3>申请信息</h3>
      <ul class="list">
        <li>申请人：{{ detail.applicant }}</li>
        <li>用途：{{ detail.purpose }}</li>
        <li>自定义字段：{{ detail.custom }}</li>
      </ul>
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
  applicant: "示例用户",
  purpose: "演示用途",
  status: "审核中"
}));
</script>
