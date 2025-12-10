<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">开发数据</p>
        <h2>上传开发数据</h2>
        <p class="muted">填写元数据后上传数据集，支持公开或私有。</p>
      </div>
      <button class="primary" type="button" @click="submit">创建</button>
    </header>

    <article class="section-card">
      <h3>基础信息</h3>
      <div class="form-grid">
        <label>
          数据集名称
          <input v-model="form.title" type="text" placeholder="如：医学影像分割" />
        </label>
        <label>
          领域
          <input v-model="form.domain" type="text" placeholder="NLP / CV / Audio" />
        </label>
        <label>
          可见性
          <select v-model="form.visibility">
            <option value="public">公开</option>
            <option value="private">私有</option>
          </select>
        </label>
        <label class="full">
          简介
          <textarea v-model="form.description" rows="3" placeholder="说明数据集来源、格式与规模" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>文件上传</h3>
      <div class="form-grid">
        <label class="full">
          压缩包
          <input type="file" />
        </label>
        <label>
          校验方式
          <select v-model="form.checksum">
            <option>MD5</option>
            <option>SHA256</option>
          </select>
        </label>
        <label>
          校验值
          <input v-model="form.checksumValue" type="text" placeholder="自动或手动填写" />
        </label>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const form = reactive({
  title: "",
  domain: "",
  visibility: "public",
  description: "",
  checksum: "MD5",
  checksumValue: ""
});

const submit = () => {
  alert(`已创建数据集：${JSON.stringify(form, null, 2)}`);
};
</script>
