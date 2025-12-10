<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">词条</p>
        <h2>编辑词条 #{{ form.id }}</h2>
        <p class="muted">更新词条描述或追加附件。</p>
      </div>
      <button class="primary" type="button" @click="save">保存</button>
    </header>

    <article class="section-card">
      <h3>内容</h3>
      <div class="form-grid">
        <label>
          标题
          <input v-model="form.title" type="text" />
        </label>
        <label>
          标签
          <input v-model="form.tags" type="text" />
        </label>
        <label class="full">
          描述
          <textarea v-model="form.description" rows="3" />
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
  title: `词条 #${route.params.id}`,
  tags: "ml, ai",
  description: "示例描述"
});

const save = () => {
  alert(`已保存词条 ${form.id}`);
};
</script>
