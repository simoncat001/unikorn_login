<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">模板中心</p>
        <h2>创建模板</h2>
        <p class="muted">上传模型模板及元数据，方便他人发现与复用。</p>
      </div>
      <button class="primary" type="button" @click="submitTemplate">提交模板</button>
    </header>

    <div class="grid two-cols">
      <article class="section-card">
        <h3>基础信息</h3>
        <div class="form-grid">
          <label>
            模板名称
            <input v-model="form.name" type="text" placeholder="如：LLM 微调模板" />
          </label>
          <label>
            版本
            <input v-model="form.version" type="text" placeholder="v1.0.0" />
          </label>
          <label class="full">
            模板简介
            <textarea v-model="form.description" rows="3" placeholder="说明模板适用场景、输入输出格式等" />
          </label>
          <label class="full">
            标签（逗号分隔）
            <input v-model="tagsInput" type="text" placeholder="nlp, 微调, pytorch" />
          </label>
        </div>
      </article>

      <article class="section-card">
        <h3>框架与资源</h3>
        <div class="form-grid">
          <label>
            训练框架
            <select v-model="form.framework">
              <option disabled value="">请选择</option>
              <option>PyTorch</option>
              <option>TensorFlow</option>
              <option>ONNX</option>
              <option>其他</option>
            </select>
          </label>
          <label>
            许可证
            <select v-model="form.license">
              <option disabled value="">选择许可证</option>
              <option>Apache-2.0</option>
              <option>MIT</option>
              <option>GPL-3.0</option>
              <option>专有</option>
            </select>
          </label>
          <label class="full">
            上传文件
            <input type="file" multiple />
            <p class="muted">支持模型文件、配置与示例脚本。</p>
          </label>
          <label class="full">
            预览地址
            <input v-model="form.previewUrl" type="url" placeholder="https://example.com/demo" />
          </label>
        </div>
      </article>
    </div>

    <article class="section-card">
      <h3>使用说明</h3>
      <div class="form-grid">
        <label class="full">
          输入格式
          <textarea v-model="form.inputFormat" rows="3" placeholder="描述必需的字段、数据结构或文件夹组织方式" />
        </label>
        <label class="full">
          输出格式
          <textarea v-model="form.outputFormat" rows="3" placeholder="给出推理或训练的输出示例" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>发布选项</h3>
      <div class="form-grid">
        <label>
          可见性
          <select v-model="form.visibility">
            <option value="public">公开</option>
            <option value="private">私有</option>
          </select>
        </label>
        <label>
          审核人
          <input v-model="form.reviewer" type="text" placeholder="如：审核员 A" />
        </label>
      </div>
      <p class="muted">提交后将创建一条新的模板记录并进入审核流程。</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";

const form = reactive({
  name: "",
  version: "",
  description: "",
  framework: "",
  license: "",
  previewUrl: "",
  inputFormat: "",
  outputFormat: "",
  visibility: "public",
  reviewer: "",
  tags: [] as string[]
});

const tagsInput = ref("");

watch(
  () => tagsInput.value,
  (val) => {
    form.tags = val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
);

const submitTemplate = () => {
  const payload = { ...form, tags: form.tags };
  alert(`将提交模板：${JSON.stringify(payload, null, 2)}`);
};
</script>
