<template>
  <section class="stack">
    <header class="section-header">
      <div>
        <p class="eyebrow">模板推荐</p>
        <h2>智能推荐</h2>
        <p class="muted">根据常见场景筛选模板，支持按标签与框架过滤，并可查看热度排序。</p>
      </div>
      <div class="filters">
        <label class="field">
          <span>框架</span>
          <select v-model="filters.framework">
            <option value="">全部框架</option>
            <option>PyTorch</option>
            <option>TensorFlow</option>
            <option>ONNX</option>
            <option>JAX</option>
          </select>
        </label>
        <label class="field">
          <span>排序</span>
          <select v-model="filters.sort">
            <option value="popular">按热度</option>
            <option value="recent">最新更新</option>
            <option value="alpha">按名称</option>
          </select>
        </label>
        <label class="field">
          <span>关键词</span>
          <input v-model="filters.keyword" type="search" placeholder="搜索模板" />
        </label>
      </div>
    </header>

    <div class="chip-row" aria-label="标签过滤">
      <button
        v-for="tag in allTags"
        :key="tag"
        class="chip"
        :class="{ active: filters.tags.has(tag) }"
        type="button"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="summary-bar">
      <div>
        <strong>{{ filtered.length }}</strong> 个匹配结果
        <span class="muted"> · 推荐优先展示下载量高与近期更新的模板</span>
      </div>
      <div class="muted">
        <span class="dot">●</span>
        {{ highlightedNames.join("、") }}
        <span> 近期被频繁使用</span>
      </div>
    </div>

    <div class="grid two-cols">
      <article v-for="item in filtered" :key="item.id" class="section-card">
        <header class="section-header" style="gap: 8px;">
          <div>
            <p class="eyebrow">{{ item.framework }}</p>
            <h3 style="margin: 0 0 4px;">{{ item.name }}</h3>
            <p class="muted">{{ item.description }}</p>
          </div>
          <div class="stack" style="align-items: flex-end; gap: 6px;">
            <span class="badge">{{ item.license }}</span>
            <small class="muted">{{ item.updated }} 更新</small>
          </div>
        </header>

        <dl class="meta">
          <div>
            <dt>标签</dt>
            <dd class="chips">
              <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span>
            </dd>
          </div>
          <div>
            <dt>下载量</dt>
            <dd>{{ item.downloads.toLocaleString() }}</dd>
          </div>
          <div>
            <dt>维护者</dt>
            <dd>{{ item.owner }}</dd>
          </div>
        </dl>

        <div class="actions">
          <button class="secondary" type="button">查看详情</button>
          <button class="primary" type="button">快速使用</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

type Template = {
  id: number;
  name: string;
  description: string;
  framework: string;
  license: string;
  tags: string[];
  downloads: number;
  updated: string;
  owner: string;
};

const list: Template[] = [
  {
    id: 1,
    name: "中文问答模板",
    description: "用于快速搭建中文问答场景，支持长上下文与召回。",
    framework: "PyTorch",
    license: "Apache-2.0",
    tags: ["qa", "中文", "rag"],
    downloads: 12540,
    updated: "3 天前",
    owner: "Unikorn 团队"
  },
  {
    id: 2,
    name: "图像分类基线",
    description: "包含训练脚本与推理示例，适配常见 GPU 环境。",
    framework: "TensorFlow",
    license: "MIT",
    tags: ["vision", "baseline"],
    downloads: 8420,
    updated: "1 周前",
    owner: "CV Hub"
  },
  {
    id: 3,
    name: "多语言摘要",
    description: "多语种摘要生成与评估流程，集成 Rouge 指标。",
    framework: "PyTorch",
    license: "Apache-2.0",
    tags: ["nlp", "summary", "multilingual"],
    downloads: 9700,
    updated: "5 天前",
    owner: "社区贡献"
  },
  {
    id: 4,
    name: "ONNX 推理加速",
    description: "提供转换脚本与性能对比，适合推理服务化场景。",
    framework: "ONNX",
    license: "BSD-3-Clause",
    tags: ["inference", "serving", "performance"],
    downloads: 13210,
    updated: "2 天前",
    owner: "Runtime 团队"
  },
  {
    id: 5,
    name: "多模态匹配",
    description: "图文匹配与检索示例，覆盖对比学习与可视化。",
    framework: "JAX",
    license: "Apache-2.0",
    tags: ["multimodal", "retrieval"],
    downloads: 6510,
    updated: "4 天前",
    owner: "Research Lab"
  }
];

const filters = reactive({
  framework: "",
  keyword: "",
  sort: "popular" as "popular" | "recent" | "alpha",
  tags: new Set<string>(),
});

const allTags = computed(() => {
  const tagSet = new Set<string>();
  list.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
});

const filtered = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  const hasKeyword = keyword.length > 0;

  let results = list.filter((item) => {
    const byFramework = filters.framework ? item.framework === filters.framework : true;
    const byKeyword = hasKeyword
      ? item.name.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
      : true;
    const byTags = filters.tags.size
      ? item.tags.some((tag) => filters.tags.has(tag))
      : true;
    return byFramework && byKeyword && byTags;
  });

  switch (filters.sort) {
    case "recent":
      results = [...results].sort((a, b) => parseUpdatedDays(a.updated) - parseUpdatedDays(b.updated));
      break;
    case "alpha":
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      results = [...results].sort((a, b) => b.downloads - a.downloads);
  }

  return results;
});

const highlightedNames = computed(() => filtered.value.slice(0, 3).map((item) => item.name));

function toggleTag(tag: string) {
  if (filters.tags.has(tag)) {
    filters.tags.delete(tag);
  } else {
    filters.tags.add(tag);
  }
}

function parseUpdatedDays(label: string) {
  const match = label.match(/(\d+)\s*天?/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
</script>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
}

.field {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--muted-foreground);
}

.field input,
.field select {
  width: 100%;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  gap: 12px;
}

.summary-bar .dot {
  color: #5c73ff;
  margin-right: 6px;
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin: 12px 0;
}

.meta dt {
  font-size: 12px;
  color: var(--muted-foreground);
}

.meta dd {
  margin: 4px 0 0;
}

.chip.active {
  background: var(--primary-mute);
  color: var(--primary);
  border-color: var(--primary-mute);
}
</style>
