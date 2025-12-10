<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">个人中心</p>
        <h2>{{ title }}</h2>
        <p class="muted">根据 itemType 提供不同的管理功能。</p>
      </div>
      <button class="secondary" type="button">刷新</button>
    </header>

    <article class="section-card">
      <h3>我的记录</h3>
      <div class="list">
        <div v-for="item in list" :key="item" class="list-row">
          <div>
            <strong>{{ item }}</strong>
            <p class="muted">演示数据：在此展示用户的提交记录。</p>
          </div>
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
  const itemType = route.params.itemType as string;
  return itemType ? `我的 ${itemType}` : "个人中心";
});

const list = computed(() =>
  Array.from({ length: 3 }).map((_, idx) => `${title.value} - 记录 ${idx + 1}`)
);
</script>
