<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">应用数据</p>
        <h2>上传应用数据</h2>
        <p class="muted">提交模型推理或应用侧产生的数据，便于审核与追踪。</p>
      </div>
      <button class="primary" type="button" @click="submit">提交</button>
    </header>

    <article class="section-card">
      <h3>基本信息</h3>
      <div class="form-grid">
        <label>
          应用名称
          <input v-model="form.app" type="text" placeholder="如：语音助手" />
        </label>
        <label>
          版本
          <input v-model="form.version" type="text" placeholder="1.0.0" />
        </label>
        <label class="full">
          描述
          <textarea v-model="form.description" rows="3" placeholder="描述上传目的与数据范围" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>上传文件</h3>
      <input type="file" multiple />
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  app: "",
  version: "",
  description: ""
});

const submit = () => {
  alert(`已提交应用数据：${JSON.stringify(form, null, 2)}`);
};
</script>
