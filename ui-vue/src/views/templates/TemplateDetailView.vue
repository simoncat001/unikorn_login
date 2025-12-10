<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">模板详情</p>
        <h2>{{ template.name }}</h2>
        <p class="muted">版本 {{ template.version }} · {{ template.framework }} · {{ template.license }}</p>
      </div>
      <div class="stack" style="align-items: flex-end; gap: 8px;">
        <span class="badge">{{ template.visibility === "public" ? "公开" : "私有" }}</span>
        <button class="secondary" type="button">下载资源</button>
      </div>
    </header>

    <article class="section-card">
      <h3>摘要</h3>
      <p>{{ template.description }}</p>
      <div class="chips">
        <span v-for="tag in template.tags" :key="tag" class="chip">{{ tag }}</span>
      </div>
    </article>

    <div class="grid two-cols">
      <article class="section-card">
        <h3>使用说明</h3>
        <p class="muted">输入格式</p>
        <pre class="code-block">{{ template.inputFormat }}</pre>
        <p class="muted">输出格式</p>
        <pre class="code-block">{{ template.outputFormat }}</pre>
      </article>

      <article class="section-card">
        <h3>资源</h3>
        <ul class="list">
          <li>
            预览地址：
            <a :href="template.previewUrl" target="_blank">{{ template.previewUrl }}</a>
          </li>
          <li>审核人：{{ template.reviewer }}</li>
          <li>最近更新：{{ template.updatedAt }}</li>
        </ul>
        <button class="primary" type="button">发起使用申请</button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const template = computed(() => ({
  id: route.params.id as string,
  name: `模板 #${route.params.id}`,
  version: "v1.0.0",
  description: "演示数据：根据 ID 从接口获取完整的模板元数据。",
  framework: "PyTorch",
  license: "Apache-2.0",
  tags: ["nlp", "finetune", "demo"],
  inputFormat: "{\n  \"prompt\": string,\n  \"inputs\": Record<string, any>\n}",
  outputFormat: "{\n  \"result\": string,\n  \"logits\": number[]\n}",
  previewUrl: "https://example.com/demo",
  reviewer: "审核员 A",
  visibility: "public",
  updatedAt: "2024-05-01"
}));
</script>
