<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">认证</p>
        <h2>登录</h2>
        <p class="muted">输入账号密码完成统一登录。</p>
      </div>
      <button class="secondary" type="button" @click="fillDemo">填充示例</button>
    </header>

    <article class="section-card" style="max-width: 480px;">
      <form class="stack" @submit.prevent="submit">
        <label>
          邮箱
          <input v-model="form.email" type="email" placeholder="name@example.com" required />
        </label>
        <label>
          密码
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </label>
        <button class="primary" type="submit">立即登录</button>
      </form>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  email: "",
  password: ""
});

const submit = () => {
  alert(`登录请求：${JSON.stringify(form, null, 2)}`);
};

const fillDemo = () => {
  form.email = "demo@example.com";
  form.password = "password";
};
</script>
