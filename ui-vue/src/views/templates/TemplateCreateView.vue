<template>
  <div class="template-create-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div class="main-content">
        <div class="form-container">
          <div class="stepper-wrapper">
            <div class="stepper">
              <div 
                v-for="(step, index) in steps" 
                :key="index"
                class="step"
                :class="{ active: index === activeStep, completed: index < activeStep }"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-label">{{ step }}</div>
                <div v-if="index < steps.length - 1" class="step-connector"></div>
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div v-if="activeStep === 0" class="step-content">
            <div class="form-section-aligned">
              <div class="form-row-aligned">
                <label class="form-label-aligned required">模板标题：</label>
                <div class="form-input-wrapper">
                  <input 
                    v-model="basicInfo.title" 
                    type="text" 
                    class="form-input-styled"
                  />
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned required">数据产生方式：</label>
                <div class="form-input-wrapper radio-group-horizontal">
                  <label class="radio-label"><input type="radio" v-model="basicInfo.data_generation_method" value="experiment"> 实验</label>
                  <label class="radio-label"><input type="radio" v-model="basicInfo.data_generation_method" value="calculation"> 计算</label>
                  <label class="radio-label"><input type="radio" v-model="basicInfo.data_generation_method" value="production"> 生产</label>
                  <label class="radio-label"><input type="radio" v-model="basicInfo.data_generation_method" value="other"> 其它</label>
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned">单位：</label>
                <div class="form-input-wrapper">
                  <input 
                    v-model="basicInfo.unit" 
                    type="text" 
                    class="form-input-styled"
                  />
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned">模板发表平台：</label>
                <div class="form-input-wrapper">
                  <input 
                    v-model="basicInfo.platform" 
                    type="text" 
                    class="form-input-styled"
                  />
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned required">模板类型：</label>
                <div class="form-input-wrapper radio-group-vertical">
                  <label class="radio-label"><input type="radio" v-model="basicInfo.template_type" value="sample"> 样品信息 (Sample)</label>
                  <label class="radio-label"><input type="radio" v-model="basicInfo.template_type" value="source"> 源数据 (Source)</label>
                  <label class="radio-label"><input type="radio" v-model="basicInfo.template_type" value="derived"> 衍生数据 (Derived)</label>
                  <label class="radio-label"><input type="radio" v-model="basicInfo.template_type" value="application"> 应用数据集 (Application)</label>
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned required">来源标准号：</label>
                <div class="form-input-wrapper">
                  <input 
                    v-model="basicInfo.source_standard_number" 
                    type="text" 
                    class="form-input-styled"
                  />
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned required">来源标准名称：</label>
                <div class="form-input-wrapper">
                  <input 
                    v-model="basicInfo.source_standard_name" 
                    type="text" 
                    class="form-input-styled"
                  />
                </div>
              </div>

              <div class="form-actions-centered">
                <button type="button" class="btn-next" @click="goToStep2">
                  下 一 步
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeStep === 1" class="step-content">
            <h2 class="form-title">模板创建</h2>

            <div class="form-section-aligned">
              <div class="template-step-workspace" aria-label="模板编辑工作区">
                <!-- Edge handle (always visible when collapsed) -->
                <button
                  v-if="isPresetPanelCollapsed"
                  type="button"
                  class="preset-edge-handle"
                  aria-label="展开模板结构预览浮窗"
                  title="展开模板结构预览"
                  @click="togglePresetPanel"
                >
                  <span class="edge-handle-icon">›</span>
                  <span class="edge-handle-text">模板结构预览</span>
                </button>

                <!-- Real floating panel overlay -->
                <div
                  v-if="!isPresetPanelCollapsed"
                  class="preset-float-overlay"
                  aria-label="预设字段浮窗遮罩"
                  @click.self="togglePresetPanel"
                >
                  <aside class="preset-float-panel" aria-label="预设字段浮窗">
                    <div class="preset-panel-header">
                      <div class="preset-panel-title">模板结构预览</div>
                      <button
                        type="button"
                        class="preset-panel-close"
                        aria-label="收起预设字段浮窗"
                        title="收起"
                        @click="togglePresetPanel"
                      >
                        ×
                      </button>
                    </div>

                    <div class="preset-panel-body">
                      <div class="tree-view-content tree-view-content--floating">
                        <h3 class="tree-title">模板结构预览</h3>
                        <div class="tree-info">
                          <p><strong>模板名称:</strong> {{ basicInfo.title || '未命名' }}</p>
                          <p><strong>模板类型:</strong> {{ getTemplateTypeLabel(basicInfo.template_type) }}</p>
                        </div>

                        <div class="preset-words">
                          <h4>预定义字段</h4>
                          <div v-if="currentPresetWords.length > 0" class="preset-list">
                            <ul class="preset-items-vertical">
                              <li v-for="(w, idx) in currentPresetWords" :key="idx" class="preset-item">
                                {{ w }}
                              </li>
                            </ul>
                          </div>
                          <p v-else class="no-preset">暂无预定义字段</p>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>

                <!-- Editor is always full-width; floating panel does not participate in layout -->
                <section class="editor-workspace" aria-label="字段输入区域">
                  <div class="template-editor-canvas-center" aria-label="画布居中容器">
                    <div class="template-editor-zoombar" aria-label="画布缩放工具栏">
                      <div class="zoombar-left">
                        <span class="zoom-label">缩放</span>
                        <span class="zoom-value">{{ Math.round(canvasZoom * 100) }}%</span>
                      </div>
                      <div class="zoombar-actions">
                        <button
                          type="button"
                          class="btn btn-outline btn-zoom"
                          :disabled="canvasZoom <= ZOOM_MIN"
                          @click="setCanvasZoom(canvasZoom - ZOOM_STEP)"
                          aria-label="缩小"
                          title="缩小"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline btn-zoom"
                          :disabled="canvasZoom >= ZOOM_MAX"
                          @click="setCanvasZoom(canvasZoom + ZOOM_STEP)"
                          aria-label="放大"
                          title="放大"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          class="btn btn-secondary btn-zoom-reset"
                          @click="setCanvasZoom(1)"
                          aria-label="重置缩放"
                          title="重置"
                        >
                          重置
                        </button>
                      </div>
                    </div>
                    <div class="template-editor-canvas" aria-label="模板编辑画板">
                      <div
                        class="template-editor-canvas-inner"
                        :style="{
                          transform: `scale(${canvasZoom})`,
                          transformOrigin: 'top left'
                        }"
                      >
                        <TemplateEditor
                          :level="0"
                          :max-level="10"
                          v-model:items="templateData.level0"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div class="form-actions-centered" style="gap: 20px;">
                <button type="button" class="btn btn-secondary" @click="goToStep1">
                  上一步
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline"
                  :disabled="isSubmitting"
                  @click="saveDraft"
                >
                  保存草稿
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                  @click="submitForReview"
                >
                  {{ isSubmitting ? '提交中...' : '提交审核' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="success-modal">
      <div class="success-content">
        <div class="success-icon">✓</div>
        <h2>提交成功!</h2>
        <p>模板ID: {{ createdTemplateId }}</p>
        <div class="success-actions">
          <button class="btn btn-primary" @click="goToTemplateDetail">
            查看模板
          </button>
          <button class="btn btn-secondary" @click="createAnother">
            继续创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainAppBar from "@/components/MainAppBar.vue";
import TemplateEditor from "@/components/templates/TemplateEditor.vue";
import TemplatePresetWords from "@/components/templates/TemplatePresetWords.vue";
import TemplateService from "@/api/TemplateService";
import TemplateDraftService from "@/api/TemplateDraftService";
import { getUser } from "@/api/AuthService";

const isPresetPanelCollapsed = ref(false);
const togglePresetPanel = () => {
  isPresetPanelCollapsed.value = !isPresetPanelCollapsed.value;
};

const route = useRoute();
const router = useRouter();
const steps = ["模板基本信息", "模板创建"];
const activeStep = ref(0);
const errorMessage = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);
const createdTemplateId = ref("");
const draftId = ref<string | null>(null);

const basicInfo = reactive({
  title: "",
  data_generation_method: "experiment",
  unit: "",
  platform: "MGSDB",
  template_type: "sample",
  source_standard_number: "",
  source_standard_name: ""
});

const templateData = reactive({
  level0: [] as any[]
});

const presetWordList = ref<{ [key: string]: string[] }>({});

// --- Canvas zoom (independent of browser zoom) ---
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;
const canvasZoom = ref(1);

const normalizeZoom = (z: number) => {
  if (!Number.isFinite(z)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100));
};

const setCanvasZoom = (z: number) => {
  canvasZoom.value = normalizeZoom(z);
  try {
    sessionStorage.setItem("templateEditorCanvasZoom", String(canvasZoom.value));
  } catch {
    // ignore
  }
};

const currentPresetWords = computed(() => {
  const list = presetWordList.value[basicInfo.template_type] || [];
  return list.map(w => {
    const parts = w.split(':');
    if (parts.length < 3) return w;
    return parts.slice(0, parts.length - 2).join(':');
  });
});

onMounted(async () => {
  try {
    const saved = sessionStorage.getItem("templateEditorCanvasZoom");
    if (saved) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed)) canvasZoom.value = normalizeZoom(parsed);
    }
  } catch {
    // ignore
  }

  try {
    presetWordList.value = await TemplateService.getPresetWordList();
  } catch (e) {
    console.error("Failed to fetch preset word list", e);
  }

  // Default unit from current user's organization (真实值来自登录信息).
  // Note: sessionStorage 里可能还没写入 user（比如直接刷新页面），所以这里做一次兜底拉取。
  // If a draft is loaded, `loadDraft()` may overwrite this afterwards.
  const readOrg = (u: any): string | undefined =>
    (u?.organization as string | undefined) ||
    (u?.Organization as string | undefined) ||
    (u?.org as string | undefined) ||
    (u?.institution as string | undefined);

  let user = getUser() as any;
  let org = readOrg(user);
  if (!org) {
    try {
      // Fallback: use the full current-user endpoint (includes organization).
      const me = await fetch("/api/users/me", { credentials: "include" });
      if (me.ok) {
        user = await me.json();
        org = readOrg(user);
      }
    } catch {
      // ignore
    }
  }
  if (!basicInfo.unit && org) basicInfo.unit = org;

  const qDraftId = route.query.draftId as string | undefined;
  if (qDraftId) {
    await loadDraft(qDraftId);
  }
});

const loadDraft = async (id: string) => {
  try {
    const resp = await TemplateDraftService.getDraft(id);
    if (resp.status !== 0 || !resp.data) {
      alert("加载草稿失败");
      return;
    }

    const draft = resp.data;
    const payload: any = (draft as any).json_data;
    if (!payload) {
      alert("草稿内容为空");
      return;
    }

    if (payload.basicInfo) {
      Object.assign(basicInfo, payload.basicInfo);
    }
    if (payload.templateData) {
      // Support both {level0: [...]} and direct array payloads.
      templateData.level0 = payload.templateData.level0 || payload.templateData;
    }

    draftId.value = draft.id;
  } catch (e) {
    console.error(e);
    alert("加载草稿出错");
  }
};

const getTemplateTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    sample: "样品信息",
    source: "源数据",
    derived: "衍生数据",
    application: "应用数据集"
  };
  return map[type] || type;
};

const goToStep1 = () => {
  activeStep.value = 0;
};

const goToStep2 = () => {
  if (!basicInfo.title) {
    errorMessage.value = "请输入模板标题";
    return;
  }
  if (!basicInfo.source_standard_number) {
    errorMessage.value = "请输入来源标准号";
    return;
  }
  if (!basicInfo.source_standard_name) {
    errorMessage.value = "请输入来源标准名称";
    return;
  }
  errorMessage.value = "";
  activeStep.value = 1;
};

const saveDraft = async () => {
  // Minimal draft behavior: explicit button only (no auto-save)
  if (!basicInfo.title) {
    alert("请先填写模板标题");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      basicInfo: JSON.parse(JSON.stringify(basicInfo)),
      templateData: JSON.parse(JSON.stringify(templateData)),
    };

    if (!draftId.value) {
      const res = await TemplateDraftService.createDraft({
        title: basicInfo.title,
        payload,
      });
      if (res.status === 0 && res.data?.id) {
        draftId.value = res.data.id;
        alert("草稿保存成功!");
      } else {
        alert("草稿保存失败: " + (res.message || res.status));
      }
    } else {
      const res = await TemplateDraftService.updateDraft(draftId.value, {
        title: basicInfo.title,
        payload,
      });
      if (res.status === 0) {
        alert("草稿已更新!");
      } else {
        alert("草稿更新失败: " + (res.message || res.status));
      }
    }
  } catch (e) {
    console.error(e);
    alert("草稿保存失败");
  } finally {
    isSubmitting.value = false;
  }
};

const submitForReview = async () => {
  isSubmitting.value = true;
  await new Promise(resolve => setTimeout(resolve, 500));
  createdTemplateId.value = "TMPL_" + Date.now();
  showSuccess.value = true;
  isSubmitting.value = false;
};

const goToTemplateDetail = () => {
  router.push(`/templates/detail/${createdTemplateId.value}`);
};

const createAnother = () => {
  showSuccess.value = false;
  activeStep.value = 0;
  basicInfo.title = "";
  basicInfo.template_type = "sample";
  basicInfo.source_standard_number = "";
  basicInfo.source_standard_name = "";
  templateData.level0 = [];
  draftId.value = null;
};
</script>

<style scoped>
.template-create-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.content-wrapper {
  padding-top: 64px;
}
.main-content {
  display: flex;
  justify-content: center;
  /* Always default to 1400px, regardless of viewport width */
  max-width: 1400px;
  margin: 0 auto;
  padding: 62px 24px 40px;
  gap: 40px;
}
.tree-view-sidebar {
  width: 300px;
  flex-shrink: 0;
}
.tree-view-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 84px;
}
.tree-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.tree-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.preset-words h4 {
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 12px;
}
.preset-category {
  font-size: 14px;
  margin-bottom: 8px;
}
.form-container {
  flex: 1;
  max-width: 1400px;
  width: 100%;
}

/* Step 2 workspace: full-width editor, preset words in a real floating window */
.template-step-workspace {
  position: relative;
}

.editor-workspace {
  min-width: 0;
}

/* Edge handle button (shown when panel is collapsed) */
.preset-edge-handle {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1400;

  width: 40px;
  height: 92px;
  border: 1px solid #e5e7eb;
  border-left: none;
  border-radius: 0 12px 12px 0;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.edge-handle-icon {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  color: #374151;
}

.edge-handle-text {
  font-size: 12px;
  letter-spacing: 2px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: #374151;
}

/* Overlay & floating panel */
.preset-float-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.18);
  z-index: 1500;
}

.preset-float-panel {
  position: fixed;
  left: 16px;
  top: 96px;
  bottom: 24px;
  width: min(460px, calc(100vw - 32px));
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.preset-panel-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.preset-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.preset-panel-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}

.preset-panel-body {
  height: calc(100% - 44px);
  overflow: auto;
  padding: 12px;
}

/* When tree preview is rendered inside the floating panel, avoid nested sticky/shadow */
.tree-view-content--floating {
  position: static;
  top: auto;
  box-shadow: none;
  border: none;
  padding: 0;
}

.preset-items-vertical {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preset-item {
  padding: 2px 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.25rem;
  word-break: break-word;
}

/* Keep the resizable canvas centered in the available workspace */
.template-editor-canvas-center {
  width: 100%;
  /* scroll should not shift the whole page; keep content centered */
  display: grid;
  place-items: center;
  /* keep some breathing room so resize handle isn't flush to the container */
  padding: 0 8px;
  overflow-x: auto;
  overflow-y: visible;
  /* isolate scroll from the rest of the layout */
  overscroll-behavior: contain;
}

.template-editor-zoombar {
  width: 1000px;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 auto 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.zoombar-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.zoom-label {
  font-size: 13px;
  color: #6b7280;
}

.zoom-value {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  min-width: 56px;
}

.zoombar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-zoom {
  padding: 6px 10px;
  min-width: 36px;
  height: 32px;
  line-height: 1;
  font-weight: 800;
}

.btn-zoom-reset {
  height: 32px;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Canvas: resizable + scrollbars */
.template-editor-canvas {
  width: 1400px;
  margin: 0 auto;
  /* allow resizing wider than default, but cap at 2000px */
  max-width: 2000px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  padding: 12px;

  /* make it feel like a “canvas” area */
  min-height: 360px;
  height: 1040px;
  /* allow resizing taller than viewport if desired */
  max-height: none;

  /* drag-to-resize (bottom-right handle) */
  resize: both;
  /* Window-like behavior: always show both scrollbars */
  overflow: scroll;
}

/* Make scrollbars more visible on WebKit/Blink (Chrome/Edge) */
.template-editor-canvas::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.template-editor-canvas::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.55);
  border-radius: 999px;
  border: 3px solid rgba(249, 250, 251, 1);
}

.template-editor-canvas::-webkit-scrollbar-track {
  background: rgba(243, 244, 246, 1);
}

.template-editor-canvas-inner {
  /* Stage width baseline so wide rows don't wrap too aggressively */
  min-width: 0;
}
.stepper-wrapper {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}
.stepper {
  display: flex;
  gap: 100px;
  position: relative;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}
.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}
.step.active .step-number {
  background-color: #3f51b5;
}
.step-label {
  font-size: 14px;
  color: #999;
}
.step.active .step-label {
  color: #3f51b5;
  font-weight: 500;
}
.step-connector {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100px;
  /* default size */
  width: 1400px;
  /* don't overflow the (1400px) page container on smaller screens */
  max-width: 100%;
  /* allow resizing wider than the default container, up to 2000px */
  max-width: min(100%, 2000px);
  z-index: 0;
  transform: translateX(50%);
}
.step:last-child .step-connector {
  display: none;
}
.error-banner {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}
.step-content {
  background: white;
  border-radius: 4px;
  /* symmetric padding so the content appears truly centered */
  padding: 40px;
  margin: 0 auto;
  box-shadow: none;
}
.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  text-align: center;
}
.form-section {
  max-width: 600px;
  margin: 0 auto;
}
.form-row {
  margin-bottom: 24px;
}
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}
.form-label.required::after {
  content: " *";
  color: #f44336;
}
.form-input, .form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #3f51b5;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
.btn {
  padding: 10px 32px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  min-width: 100px;
}
.btn-primary {
  background-color: #3f51b5;
  color: white;
  box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
}
.btn-primary:hover:not(:disabled) {
  background-color: #303f9f;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12);
}
.btn-secondary {
  background-color: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
  box-shadow: 0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12);
}
.btn-secondary:hover {
  background-color: #d5d5d5;
}
.btn-outline {
  background-color: transparent;
  color: #3f51b5;
  border: 1px solid rgba(63, 81, 181, 0.5);
}
.btn-outline:hover {
  background-color: rgba(63, 81, 181, 0.04);
  border: 1px solid #3f51b5;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.success-content {
  background: white;
  border-radius: 8px;
  padding: 40px;
  max-width: 400px;
  text-align: center;
}
.success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.success-content h2 {
  font-size: 24px;
  margin-bottom: 12px;
}
.success-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}
.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* New Styles for Aligned Form */
.form-section-aligned {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px 0;
}

.form-row-aligned {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.form-label-aligned {
  width: 180px;
  margin-right: 24px;
  font-weight: 600;
  color: #333;
  font-size: 15px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 40px; /* Fixed height to match inputs */
}

.form-label-aligned.required::before {
  content: "*";
  color: #f44336;
  margin-right: 4px;
  font-family: sans-serif;
}

.form-input-wrapper {
  flex: 1;
  max-width: 500px;
}

.form-input-styled {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  color: #333;
  box-sizing: border-box;
}

.form-input-styled:hover {
  border-color: #40a9ff;
}

.form-input-styled:focus {
  border-color: #3f51b5;
  box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
}

.radio-group-horizontal {
  display: flex;
  gap: 24px;
  align-items: center;
  height: 40px;
}

.radio-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  height: 40px; /* Match input height */
}

.radio-label input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #3f51b5;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.radio-label input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #3f51b5;
}

.form-actions-centered {
  display: flex;
  justify-content: center;
  margin-top: 60px;
}

.btn-next {
  background-color: #3f51b5;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 10px 32px;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-weight: 500;
}

.btn-next:hover {
  background-color: #303f9f;
}
</style>