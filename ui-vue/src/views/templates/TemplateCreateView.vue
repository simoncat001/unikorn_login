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
          <label>
            分类
            <select v-model="form.category">
              <option disabled value="">请选择</option>
              <option>文本生成</option>
              <option>多模态</option>
              <option>语音</option>
              <option>视觉</option>
            </select>
          </label>
          <label>
            任务类型
            <input v-model="form.taskType" type="text" placeholder="微调 / 推理 / 评测" />
          </label>
          <label>
            适配语言
            <input v-model="form.languages" type="text" placeholder="zh, en, ja" />
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
          <label>
            模型大小
            <input v-model="form.size" type="text" placeholder="例如：1.2GB" />
          </label>
          <label>
            运行依赖
            <input v-model="form.dependencies" type="text" placeholder="torch>=2.0, transformers" />
          </label>
          <label>
            需要显存
            <input v-model="form.minGpu" type="text" placeholder="例如：16GB" />
          </label>
          <label>
            兼容数据集
            <input v-model="form.datasets" type="text" placeholder="如：c4, wudao" />
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
        <label class="full">
          操作步骤
          <textarea
            v-model="form.steps"
            rows="4"
            placeholder="分步说明如何准备数据、安装依赖、启动训练/推理与评估。"
          />
        </label>
        <label class="full">
          最佳实践
          <textarea v-model="form.bestPractice" rows="3" placeholder="提供超参建议、硬件配置与常见问题排查" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <h3>质量校验</h3>
      <div class="checklist">
        <label v-for="item in checklist" :key="item.key" class="check-item">
          <input v-model="form.quality[item.key]" type="checkbox" />
          <div>
            <p>{{ item.label }}</p>
            <p class="muted">{{ item.desc }}</p>
          </div>
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
          维护者
          <input v-model="form.maintainer" type="text" placeholder="如：data-team" />
        </label>
        <label>
          支持渠道
          <input v-model="form.support" type="text" placeholder="Issue、钉钉群或邮箱" />
        </label>
        <label>
          审核人
          <input v-model="form.reviewer" type="text" placeholder="如：审核员 A" />
        </label>
      </div>
      <p class="muted">提交后将创建一条新的模板记录并进入审核流程。</p>
    </article>

    <article class="section-card">
      <h3>预览</h3>
      <div class="preview">
        <div>
          <p class="eyebrow">提交载荷</p>
          <pre class="code-block">{{ formattedPayload }}</pre>
        </div>
        <div>
          <p class="eyebrow">校验结果</p>
          <ul class="muted">
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            <li v-if="!validationErrors.length">所有必填项已完成，可提交。</li>
          </ul>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

const form = reactive({
  name: "",
  version: "",
  description: "",
  category: "",
  taskType: "",
  languages: "",
  framework: "",
  license: "",
  size: "",
  dependencies: "",
  minGpu: "",
  datasets: "",
  previewUrl: "",
  inputFormat: "",
  outputFormat: "",
  steps: "",
  bestPractice: "",
  visibility: "public",
  reviewer: "",
  maintainer: "",
  support: "",
  tags: [] as string[],
  quality: {
    runnable: false,
    docsComplete: false,
    versioned: false,
    security: false
  }
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
  if (validationErrors.value.length) {
    alert(`请先完善必填项：\n${validationErrors.value.join("\n")}`);
    return;
  }

  const payload = { ...form, tags: form.tags };
  alert(`将提交模板：${JSON.stringify(payload, null, 2)}`);
};

const requiredFields: Record<string, string> = {
  name: "模板名称",
  version: "版本",
  description: "模板简介",
  category: "分类",
  taskType: "任务类型",
  framework: "训练框架",
  license: "许可证",
  inputFormat: "输入格式",
  outputFormat: "输出格式"
};

const validationErrors = computed(() => {
  return Object.entries(requiredFields)
    .filter(([key]) => !(form as Record<string, string>)[key])
    .map(([, label]) => `${label} 不能为空`);
});

const formattedPayload = computed(() =>
  JSON.stringify({ ...form, tags: form.tags }, null, 2)
);

const checklist = [
  { key: "runnable", label: "可运行验证", desc: "上传的脚本可直接复现 README 的运行指令" },
  { key: "docsComplete", label: "文档完善", desc: "包含输入输出示例、依赖与硬件说明" },
  { key: "versioned", label: "版本管理", desc: "明确版本号并在变更时更新说明" },
  { key: "security", label: "安全检查", desc: "已完成病毒扫描和敏感信息排查" }
];
</script>

<style scoped>
.checklist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  background: #fff;
}

.preview {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.code-block {
  background: #0b1021;
  color: #e6e9f4;
  padding: 12px;
  border-radius: 12px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
}
</style>
