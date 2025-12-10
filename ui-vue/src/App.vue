<template>
  <div class="main-shell">
    <header class="card" style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div>
          <h1>Unikorn Login · Vue</h1>
          <p style="margin: 0; color: #4b5563;">
            重新以 Vue 3 构建的前端骨架，已包含原有路由入口的占位页面。
          </p>
        </div>
        <span class="badge">Vue 3 + Vite</span>
      </div>
      <NavMenu />
    </header>

    <main class="card">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import NavMenu from "./components/NavMenu.vue";
</script>
