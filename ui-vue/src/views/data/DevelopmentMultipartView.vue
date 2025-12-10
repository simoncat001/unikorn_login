<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">上传测试</p>
        <h2>分片上传</h2>
        <p class="muted">模拟切片、上传与合并的流程，方便调试后端接口。</p>
      </div>
      <button class="primary" type="button" @click="startUpload">开始上传</button>
    </header>

    <article class="section-card">
      <h3>上传状态</h3>
      <div class="timeline">
        <div v-for="step in steps" :key="step.title" class="timeline-item">
          <span class="dot" :class="step.state"></span>
          <div>
            <strong>{{ step.title }}</strong>
            <p class="muted">{{ step.description }}</p>
          </div>
        </div>
      </div>
      <p v-if="progress" class="muted">当前进度：{{ progress }}%</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

const steps = reactive([
  { title: "切片文件", description: "准备将大文件拆分为多个分片", state: "pending" },
  { title: "并发上传", description: "向后端批量上传分片", state: "pending" },
  { title: "合并分片", description: "请求后端合并分片生成完整文件", state: "pending" }
]);

const progress = ref(0);

const startUpload = async () => {
  progress.value = 0;
  for (const step of steps) {
    step.state = "active";
    await new Promise((resolve) => setTimeout(resolve, 300));
    progress.value += 30;
    step.state = "done";
  }
  progress.value = 100;
};
</script>
