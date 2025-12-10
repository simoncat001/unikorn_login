<template>
  <PagePlaceholder title="页面未找到" description="您访问的地址不存在或已被移除。">
    <RouterLink to="/">返回首页</RouterLink>
  </PagePlaceholder>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import PagePlaceholder from "../components/PagePlaceholder.vue";
</script>
