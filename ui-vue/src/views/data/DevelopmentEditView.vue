<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">开发数据</p>
        <h2>编辑数据集 #{{ form.id }}</h2>
        <p class="muted">更新描述或重新上传文件。</p>
      </div>
      <button class="primary" type="button" @click="save">保存</button>
    </header>

    <article class="section-card">
      <h3>基本信息</h3>
      <div class="form-grid">
        <label>
          名称
          <input v-model="form.title" type="text" />
        </label>
        <label>
          领域
          <input v-model="form.domain" type="text" />
        </label>
        <label>
          可见性
          <select v-model="form.visibility">
            <option value="public">公开</option>
            <option value="private">私有</option>
          </select>
        </label>
      </div>
      <label class="full">
        简介
        <textarea v-model="form.description" rows="3" />
      </label>
    </article>

    <article class="section-card">
      <h3>替换文件</h3>
      <input type="file" />
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const form = reactive({
  id: route.params.id as string,
  title: `数据集 #${route.params.id}`,
  domain: "NLP",
  description: "示例描述，可从接口拉取。",
  visibility: "public"
});

const save = () => {
  alert(`已保存 ${form.id}`);
};
</script>
