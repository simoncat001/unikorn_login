<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">应用数据</p>
        <h2>上传应用数据</h2>
        <p class="muted">提交模型推理或应用侧产生的数据，补齐场景、模板、隐私与质量信息，便于审核与追踪。</p>
      </div>
      <div class="actions">
        <button class="ghost" type="button" @click="addMockFile">添加示例文件</button>
        <button class="primary" type="button" @click="submit">提交</button>
      </div>
    </header>

    <article class="section-card">
      <h3>基础信息</h3>
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
        <label>
          使用场景
          <input v-model="form.scenario" type="text" placeholder="如：客服对话、出行规划" />
        </label>
        <label>
          关联模板
          <input v-model="form.template" type="text" placeholder="选择或输入模板名称" />
        </label>
        <label>
          模板ID / MGID
          <input v-model="form.templateId" type="text" placeholder="可填写对应MGID" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>数据采集与类型</h3>
      <div class="form-grid">
        <label>
          来源
          <select v-model="form.source">
            <option>线上推理</option>
            <option>离线批处理</option>
            <option>实验室采集</option>
          </select>
        </label>
        <label>
          数据类型
          <select v-model="form.dataType">
            <option>结构化</option>
            <option>非结构化</option>
            <option>混合</option>
          </select>
        </label>
        <label>
          敏感等级
          <select v-model="form.sensitivity">
            <option value="normal">普通</option>
            <option value="internal">内部</option>
            <option value="secret">受限</option>
          </select>
        </label>
        <label>
          数据标签
          <input v-model="form.tags" type="text" placeholder="关键词，逗号分隔" />
        </label>
        <label class="full">
          采集渠道
          <div class="filters">
            <button
              v-for="channel in channelOptions"
              :key="channel"
              type="button"
              class="chip"
              :class="{ active: form.channels.includes(channel) }"
              @click="toggleChannel(channel)"
            >
              {{ channel }}
            </button>
          </div>
          <p class="muted small">至少选择一个采集/上传渠道。</p>
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>运行环境与映射</h3>
      <div class="form-grid">
        <label>
          模型 / 模板
          <input v-model="form.run.model" type="text" placeholder="如：ChatGLM / 内部模板" />
        </label>
        <label>
          运行设备
          <input v-model="form.run.device" type="text" placeholder="GPU / CPU / Edge" />
        </label>
        <label>
          批次 / 采样
          <input v-model="form.run.batch" type="text" placeholder="如：64，top-p=0.9" />
        </label>
        <label>
          时延预算
          <input v-model="form.run.latencyBudget" type="text" placeholder="如：200ms" />
        </label>
        <label class="full">
          数据映射说明
          <textarea
            v-model="form.mapping"
            rows="3"
            placeholder="说明应用字段如何映射到模板/研发数据"
          />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>上传文件</h3>
      <div class="form-grid">
        <label class="full">
          选择文件
          <input type="file" multiple />
          <p class="muted small">支持日志、JSON、CSV、音视频等格式，单个不超过 2GB。</p>
        </label>
        <label>
          校验方式
          <select v-model="form.checksum">
            <option>MD5</option>
            <option>SHA256</option>
            <option>无</option>
          </select>
        </label>
        <label>
          校验值
          <input v-model="form.checksumValue" type="text" placeholder="自动或手动填写" />
        </label>
        <label class="full">
          文件说明
          <textarea v-model="form.fileNotes" rows="2" placeholder="拆分策略、字段顺序、压缩口令等补充说明" />
        </label>
      </div>
      <div class="list compact" v-if="files.length">
        <div class="list-row" v-for="file in files" :key="file.name">
          <div>
            <div class="title">{{ file.name }}</div>
            <p class="muted small">{{ file.size }} · {{ file.status }} · {{ file.checksum }}</p>
          </div>
          <div class="actions gap">
            <span class="pill">分片 {{ file.chunks }}</span>
            <button class="ghost" type="button" @click="markReviewed(file)">标记已验</button>
            <button class="ghost" type="button" @click="removeFile(file.name)">移除</button>
          </div>
        </div>
      </div>
    </article>

    <article class="section-card">
      <h3>数据质量与隐私</h3>
      <div class="form-grid">
        <label>
          请求量
          <input v-model.number="form.metrics.total" type="number" min="0" placeholder="如：12000" />
        </label>
        <label>
          成功率
          <input v-model.number="form.metrics.success" type="number" min="0" max="100" placeholder="%" />
        </label>
        <label>
          P99 时延
          <input v-model="form.metrics.latencyP99" type="text" placeholder="如：180ms" />
        </label>
        <label>
          质量评估
          <input v-model="form.metrics.quality" type="text" placeholder="如：人工抽检 98% 通过" />
        </label>
        <label>
          包含敏感信息
          <select v-model="form.privacy.containsPII">
            <option :value="false">否</option>
            <option :value="true">是</option>
          </select>
        </label>
        <label>
          已匿名化
          <select v-model="form.privacy.anonymized">
            <option :value="true">是</option>
            <option :value="false">否</option>
          </select>
        </label>
        <label>
          保留周期
          <select v-model="form.privacy.retention">
            <option>30 天</option>
            <option>90 天</option>
            <option>180 天</option>
            <option>长期</option>
          </select>
        </label>
        <label>
          通知负责人
          <input v-model="form.contact.owner" type="text" placeholder="如：张三 / 团队名称" />
        </label>
        <label>
          联系邮箱
          <input v-model="form.contact.email" type="email" placeholder="review@example.com" />
        </label>
        <label>
          提交后通知
          <select v-model="form.contact.notify">
            <option :value="true">是</option>
            <option :value="false">否</option>
          </select>
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>提交清单</h3>
      <ul class="kv">
        <li>
          <span>必填项</span>
          <strong>{{ missingRequired ? `缺少 ${missingRequired} 项` : "已完成" }}</strong>
        </li>
        <li>
          <span>文件准备</span>
          <strong>{{ files.length ? `${files.length} 个文件` : "待上传" }}</strong>
        </li>
        <li>
          <span>敏感性校验</span>
          <strong>{{ form.privacy.containsPII ? "需脱敏" : "无敏感信息" }}</strong>
        </li>
        <li>
          <span>保留周期</span>
          <strong>{{ form.privacy.retention }}</strong>
        </li>
      </ul>
      <div class="code-block">{{ payloadPreview }}</div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

const channelOptions = ["接口采集", "日志同步", "人工上传", "SDK推送"];

const form = reactive({
  app: "",
  version: "",
  description: "",
  scenario: "",
  template: "",
  templateId: "",
  source: "线上推理",
  dataType: "结构化",
  sensitivity: "normal",
  tags: "",
  channels: ["接口采集"],
  mapping: "",
  checksum: "MD5",
  checksumValue: "",
  fileNotes: "",
  run: {
    model: "",
    device: "",
    batch: "",
    latencyBudget: "",
  },
  metrics: {
    total: 0,
    success: 0,
    latencyP99: "",
    quality: "",
  },
  privacy: {
    containsPII: false,
    anonymized: true,
    retention: "180 天",
  },
  contact: {
    owner: "",
    email: "",
    notify: true,
  },
});

type UploadedFile = {
  name: string;
  size: string;
  status: string;
  checksum: string;
  chunks: number;
};

const files = ref<UploadedFile[]>([
  {
    name: "predict-logs-202404.tar.gz",
    size: "120MB",
    status: "已校验",
    checksum: "MD5: 8b1a9953",
    chunks: 6,
  },
]);

const toggleChannel = (channel: string) => {
  const exists = form.channels.includes(channel);
  if (exists) {
    form.channels = form.channels.filter((c) => c !== channel);
  } else {
    form.channels.push(channel);
  }
};

const addMockFile = () => {
  files.value.push({
    name: `app-data-${files.value.length + 1}.csv`,
    size: "32MB",
    status: "待校验",
    checksum: "未提供",
    chunks: 3,
  });
};

const removeFile = (name: string) => {
  files.value = files.value.filter((file) => file.name !== name);
};

const markReviewed = (file: UploadedFile) => {
  file.status = "人工抽检通过";
};

const requiredFields = [
  () => form.app,
  () => form.version,
  () => form.description,
  () => form.dataType,
  () => form.source,
];

const missingRequired = computed(() => requiredFields.filter((fn) => !fn()).length);

const payloadPreview = computed(() =>
  JSON.stringify(
    {
      ...form,
      channels: form.channels,
      files: files.value,
    },
    null,
    2,
  ),
);

const submit = () => {
  if (missingRequired.value) {
    alert(`提交前请补全 ${missingRequired.value} 个必填项`);
    return;
  }

  alert(`已提交应用数据：${payloadPreview.value}`);
};
</script>
