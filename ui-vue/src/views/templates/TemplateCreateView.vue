<template>
  <div class="template-create-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div class="main-content">
        <div v-if="activeStep === 1" class="tree-view-sidebar">
          <div class="tree-view-content">
            <h3 class="tree-title">模板结构预览</h3>
            <div class="tree-info">
              <p><strong>模板名称:</strong> {{ basicInfo.title || '未命名' }}</p>
              <p><strong>模板类型:</strong> {{ getTemplateTypeLabel(basicInfo.template_type) }}</p>
            </div>
            <div class="preset-words">
              <h4>预定义字段</h4>
              <div v-if="currentPresetWords.length > 0" class="preset-list">
                <div class="preset-category">
                  <span class="preset-items">{{ currentPresetWords.join(', ') }}</span>
                </div>
              </div>
              <p v-else class="no-preset">暂无预定义字段</p>
            </div>
          </div>
        </div>

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
              <!-- Preset Words Component -->
              <TemplatePresetWords 
                :presetWordList="presetWordList" 
                :templateType="basicInfo.template_type" 
              />

              <!-- Recursive Template Editor -->
              <TemplateEditor 
                :level="0" 
                :max-level="10"
                v-model:items="templateData.level0" 
              />

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
import { useRouter } from "vue-router";
import MainAppBar from "@/components/MainAppBar.vue";
import TemplateEditor from "@/components/templates/TemplateEditor.vue";
import TemplatePresetWords from "@/components/templates/TemplatePresetWords.vue";
import TemplateService from "@/api/TemplateService";

const router = useRouter();
const steps = ["模板基本信息", "模板创建"];
const activeStep = ref(0);
const errorMessage = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);
const createdTemplateId = ref("");

const basicInfo = reactive({
  title: "",
  data_generation_method: "experiment",
  unit: "上海交通大学",
  platform: "MGSDB",
  template_type: "sample",
  source_standard_number: "",
  source_standard_name: ""
});

const templateData = reactive({
  level0: [] as any[]
});

const presetWordList = ref<{ [key: string]: string[] }>({});

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
    presetWordList.value = await TemplateService.getPresetWordList();
  } catch (e) {
    console.error("Failed to fetch preset word list", e);
  }
});

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
  alert("草稿保存成功!");
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
  basicInfo.template_type = "";
  basicInfo.template_source = "";
  templateData.level0 = [];
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 62px 20px 40px;
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
  max-width: 900px;
  width: 100%;
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
  height: 1px;
  background-color: #e0e0e0;
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
  padding: 40px 60px;
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