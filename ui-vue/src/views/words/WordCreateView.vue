<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">词条</p>
        <h2>创建词条</h2>
        <p class="muted">录入新的词条及其解释，补充标签、来源与附件，提交审核后即可发布。</p>
      </div>
      <div class="actions">
        <button class="secondary" type="button" @click="submit('draft')">保存草稿</button>
        <button class="primary" type="button" @click="submit('submit')">提交审核</button>
      </div>
    </header>

    <article class="section-card">
      <div class="section-heading">
        <h3>基础信息</h3>
        <p class="muted">标题、别名、标签等信息将用于搜索与关联。</p>
      </div>
      <div class="form-grid">
        <label>
          标题
          <input v-model="form.title" type="text" required placeholder="例如：联邦学习" />
          <small class="muted">必填，简洁明了，建议 8-16 字。</small>
        </label>
        <label>
          别名/缩写
          <input v-model="form.alias" type="text" placeholder="例如：FL" />
          <small class="muted">可选，用于检索常用简称。</small>
        </label>
        <label>
          分类
          <select v-model="form.category">
            <option value="算法">算法</option>
            <option value="安全">安全</option>
            <option value="数据">数据</option>
            <option value="基础设施">基础设施</option>
          </select>
        </label>
        <label>
          标签
          <input v-model="form.tags" type="text" placeholder="ml, 安全, 数据" />
          <small class="muted">以逗号分隔，至少 1 个标签。</small>
        </label>
        <label class="full">
          摘要
          <textarea v-model="form.description" rows="3" placeholder="简要说明词条背景与应用" />
        </label>
      </div>
      <div class="filters" v-if="tagList.length">
        <span class="pill" v-for="tag in tagList" :key="tag">{{ tag }}</span>
      </div>
    </article>

    <article class="section-card">
      <div class="section-heading">
        <h3>释义与示例</h3>
        <p class="muted">补充权威定义、适用场景和示例，方便审核。</p>
      </div>
      <div class="form-grid">
        <label class="full">
          权威定义
          <textarea v-model="form.definition" rows="3" placeholder="来自标准或论文的定义" />
        </label>
        <label class="full">
          应用场景
          <textarea v-model="form.scenario" rows="3" placeholder="适用范围、业务场景或最佳实践" />
        </label>
        <label class="full">
          示例与参考
          <textarea v-model="form.example" rows="3" placeholder="示例句、参考链接或引用文献" />
        </label>
      </div>
    </article>

    <article class="section-card">
      <div class="section-heading">
        <h3>元数据</h3>
        <p class="muted">填写责任人、来源和发布策略。</p>
      </div>
      <div class="form-grid">
        <label>
          责任人
          <input v-model="form.owner" type="text" placeholder="知识库/研发团队" />
        </label>
        <label>
          审核人
          <input v-model="form.reviewer" type="text" placeholder="运营/法务" />
        </label>
        <label>
          联系方式
          <input v-model="form.contact" type="text" placeholder="owner@example.com" />
        </label>
        <label>
          来源链接
          <input v-model="form.source" type="url" placeholder="https://..." />
        </label>
      </div>
      <div class="actions gap">
        <label class="switch">
          <input v-model="form.visibility" type="radio" value="internal" />
          <span>仅内部可见</span>
        </label>
        <label class="switch">
          <input v-model="form.visibility" type="radio" value="public" />
          <span>可公开分享</span>
        </label>
        <label class="switch">
          <input v-model="form.requireReview" type="checkbox" />
          <span>需要二次审核</span>
        </label>
        <label class="switch">
          <input v-model="form.sensitive" type="checkbox" />
          <span>包含敏感信息</span>
        </label>
      </div>
    </article>

    <article class="section-card">
      <div class="section-heading">
        <h3>附件与参考</h3>
        <p class="muted">上传相关资料，或补充额外参考。</p>
      </div>
      <div class="form-grid">
        <label class="full">
          上传附件
          <input type="file" multiple @change="handleFiles" />
          <small class="muted">支持 doc、pdf、图片等，文件仅示例展示。</small>
        </label>
        <label class="full">
          其他参考
          <textarea v-model="form.references" rows="2" placeholder="列出标准、白皮书或相关资料" />
        </label>
      </div>
      <div class="list" v-if="form.attachments.length">
        <div class="list-row" v-for="file in form.attachments" :key="file.name">
          <div>
            <p class="strong">{{ file.name }}</p>
            <p class="muted">{{ file.size }} · {{ file.type }}</p>
          </div>
          <span class="badge">待上传</span>
        </div>
      </div>
    </article>

    <article class="section-card">
      <div class="section-heading">
        <h3>质量检查与预览</h3>
        <p class="muted">提交前快速核对关键信息。</p>
      </div>
      <div class="grid stats">
        <div class="stat-card">
          <p class="eyebrow">必填项</p>
          <h4>{{ errors.length === 0 ? '全部已完善' : `${errors.length} 项待补充` }}</h4>
          <ul class="kv" v-if="errors.length">
            <li v-for="err in errors" :key="err">
              <span>待完善</span>
              <strong>{{ err }}</strong>
            </li>
          </ul>
        </div>
        <div class="stat-card">
          <p class="eyebrow">预览</p>
          <div class="stack">
            <p class="strong">{{ form.title || '未命名词条' }}</p>
            <p class="muted">{{ form.description || '暂无摘要' }}</p>
            <div class="filters" v-if="tagList.length">
              <span class="badge" v-for="tag in tagList" :key="tag">{{ tag }}</span>
            </div>
            <p class="muted">分类：{{ form.category }} · 可见性：{{ visibilityLabel }}</p>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

type Visibility = "internal" | "public";

type Attachment = {
  name: string;
  size: string;
  type: string;
};

const form = reactive({
  title: "",
  alias: "",
  category: "算法",
  tags: "ml, 安全",
  description: "",
  definition: "",
  scenario: "",
  example: "",
  owner: "知识库团队",
  reviewer: "运营同学",
  contact: "",
  source: "",
  visibility: "internal" as Visibility,
  requireReview: true,
  sensitive: false,
  references: "",
  attachments: [
    { name: "示例定义.docx", size: "256KB", type: "docx" },
    { name: "行业标准.pdf", size: "1.2MB", type: "pdf" }
  ] as Attachment[]
});

const tagList = computed(() =>
  form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
);

const errors = computed(() => {
  const missing: string[] = [];
  if (!form.title.trim()) missing.push("标题");
  if (!form.description.trim()) missing.push("摘要");
  if (!form.definition.trim()) missing.push("权威定义");
  if (tagList.value.length === 0) missing.push("至少 1 个标签");
  return missing;
});

const visibilityLabel = computed(() =>
  form.visibility === "internal" ? "内部" : "公开"
);

const handleFiles = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files) return;

  Array.from(files).forEach((file) => {
    form.attachments.push({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      type: file.type || "未知格式"
    });
  });

  input.value = "";
};

const submit = (mode: "draft" | "submit") => {
  if (mode === "submit" && errors.value.length > 0) {
    alert(`提交前请完善：${errors.value.join("、")}`);
    return;
  }

  const payload = {
    ...form,
    tags: tagList.value,
    status: mode === "draft" ? "草稿" : "待审核"
  };

  alert(`已${mode === "draft" ? "保存草稿" : "提交审核"}：\n${JSON.stringify(payload, null, 2)}`);
};
</script>
