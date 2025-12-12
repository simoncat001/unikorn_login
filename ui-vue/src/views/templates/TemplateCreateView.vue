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
              <div v-if="presetWordList && Object.keys(presetWordList).length > 0" class="preset-list">
                <div v-for="(words, category) in presetWordList" :key="category" class="preset-category">
                  <strong>{{ category }}:</strong>
                  <span class="preset-items">{{ words.join(', ') }}</span>
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
            <h2 class="form-title">模板基本信息</h2>
            
            <div class="form-section">
              <div class="form-row">
                <label class="form-label required">
                  模板名称
                  <input 
                    v-model="basicInfo.title" 
                    type="text" 
                    class="form-input"
                    placeholder="请输入模板名称"
                  />
                </label>
              </div>

              <div class="form-row">
                <label class="form-label required">
                  模板类型
                  <select v-model="basicInfo.template_type" class="form-select">
                    <option value="">请选择模板类型</option>
                    <option value="basic">基础模板</option>
                    <option value="application">应用模板</option>
                  </select>
                </label>
              </div>

              <div class="form-row">
                <label class="form-label required">
                  模板来源
                  <select v-model="basicInfo.template_source" class="form-select">
                    <option value="">请选择模板来源</option>
                    <option value="standard">标准模板</option>
                    <option value="unstandard">非标准模板</option>
                  </select>
                </label>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-primary" @click="goToStep2">
                  下一步
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeStep === 1" class="step-content">
            <h2 class="form-title">模板创建</h2>

            <div class="form-section">
              <div class="form-row">
                <label class="form-label">
                  模板字段名称
                  <input 
                    v-model="templateData.field_name" 
                    type="text" 
                    class="form-input"
                    placeholder="请输入字段名称"
                  />
                </label>
              </div>

              <div class="form-actions">
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
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import MainAppBar from "@/components/MainAppBar.vue";

const router = useRouter();
const steps = ["模板基本信息", "模板创建"];
const activeStep = ref(0);
const errorMessage = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);
const createdTemplateId = ref("");

const basicInfo = reactive({
  title: "",
  template_type: "",
  template_source: ""
});

const templateData = reactive({
  field_name: ""
});

const presetWordList = ref<{ [key: string]: string[] }>({
  "基本信息": ["名称", "版本"],
  "技术参数": ["算法", "框架"]
});

const getTemplateTypeLabel = (type: string) => {
  return type === "basic" ? "基础模板" : type === "application" ? "应用模板" : type;
};

const goToStep1 = () => {
  activeStep.value = 0;
};

const goToStep2 = () => {
  if (!basicInfo.title) {
    errorMessage.value = "请输入模板名称";
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
  templateData.field_name = "";
};
</script>

<style scoped>
.template-create-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.content-wrapper {
  padding-top: 64px;
}
.main-content {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 62px 20px 40px;
}
.tree-view-sidebar {
  width: 300px;
  margin-right: 40px;
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
  max-width: 800px;
}
.stepper-wrapper {
  margin-bottom: 40px;
  display: flex;
  justify-content: center;
}
.stepper {
  display: flex;
  gap: 40px;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
}
.step.active .step-number {
  background-color: #3f51b5;
  color: white;
}
.step-label {
  font-size: 14px;
  color: #666;
}
.step.active .step-label {
  color: #3f51b5;
  font-weight: 600;
}
.step-connector {
  position: absolute;
  top: 20px;
  left: calc(100% + 20px);
  width: 40px;
  height: 2px;
  background-color: #e0e0e0;
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
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background-color: #3f51b5;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #303f9f;
}
.btn-secondary {
  background-color: #757575;
  color: white;
}
.btn-outline {
  background-color: white;
  color: #3f51b5;
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
</style>