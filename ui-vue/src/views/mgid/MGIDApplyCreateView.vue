<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">MGID</p>
        <h2>申请 MGID</h2>
        <p class="muted">填写申请信息以获取 MGID，用于数据治理与追踪。</p>
      </div>
      <button class="primary" type="button" @click="submit">提交申请</button>
    </header>

    <article class="section-card">
      <h3>申请信息</h3>
      <div class="form-grid">
        <label>
          申请人
          <input v-model="form.applicant" type="text" />
        </label>
        <label>
          邮箱
          <input v-model="form.email" type="email" />
        </label>
        <label class="full">
          描述
          <textarea v-model="form.description" rows="3" placeholder="说明申请原因、使用范围" />
        </label>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  applicant: "",
  email: "",
  description: ""
});

const submit = () => {
  alert(`已提交 MGID 申请：${JSON.stringify(form, null, 2)}`);
};
</script>
