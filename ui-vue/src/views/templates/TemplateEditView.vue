<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">模板中心</p>
        <h2>编辑模板 #{{ form.id }}</h2>
        <p class="muted">修改基础信息、上传新版本或更新描述。</p>
      </div>
      <button class="primary" type="button" @click="save">保存修改</button>
    </header>

    <article class="section-card">
      <h3>基础信息</h3>
      <div class="form-grid">
        <label>
          模板名称
          <input v-model="form.name" type="text" />
        </label>
        <label>
          版本
          <input v-model="form.version" type="text" />
        </label>
        <label class="full">
          简介
          <textarea v-model="form.description" rows="3" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>文件与预览</h3>
      <div class="form-grid">
        <label class="full">
          替换资源
          <input type="file" multiple />
        </label>
        <label class="full">
          预览地址
          <input v-model="form.previewUrl" type="url" />
        </label>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const form = reactive({
  id: route.params.id as string,
  name: `模板 #${route.params.id}`,
  version: "v1.0.0",
  description: "初始描述，可从接口填充。",
  previewUrl: "https://example.com/demo"
});

const save = () => {
  alert(`已保存模板 ${form.id}: ${JSON.stringify(form, null, 2)}`);
};
</script>
