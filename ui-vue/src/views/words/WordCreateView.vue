<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">词条</p>
        <h2>创建词条</h2>
        <p class="muted">录入新的词条及其解释，支持上传附件。</p>
      </div>
      <button class="primary" type="button" @click="submit">提交</button>
    </header>

    <article class="section-card">
      <h3>词条内容</h3>
      <div class="form-grid">
        <label>
          标题
          <input v-model="form.title" type="text" placeholder="例如：联邦学习" />
        </label>
        <label>
          标签
          <input v-model="form.tags" type="text" placeholder="ml, 安全, 数据" />
        </label>
        <label class="full">
          描述
          <textarea v-model="form.description" rows="3" placeholder="简要说明词条背景与应用" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>附件</h3>
      <input type="file" multiple />
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  title: "",
  tags: "",
  description: ""
});

const submit = () => {
  alert(`已创建词条：${JSON.stringify(form, null, 2)}`);
};
</script>
