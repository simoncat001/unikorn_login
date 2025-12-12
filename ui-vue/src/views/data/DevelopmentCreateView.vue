<template>
  <div class="development-create-page">
    <MainAppBar />
    <div class="content-wrapper">
      <header class="header-section">
        <h1 class="page-title">上传研发数据</h1>
      </header>

      <div class="form-container">
        <div class="form-section">
          <div class="form-row">
            <label class="form-label required">
              选择模板：
            </label>
            <div class="form-input-wrapper">
              <input
                v-model="searchKeyword"
                type="text"
                class="form-input autocomplete-input"
                placeholder="请输入模板名称"
                @input="handleTemplateSearch"
                @blur="handleTemplateBlur"
              />
              <div v-if="showTemplateList && filteredTemplates.length > 0" class="autocomplete-dropdown">
                <div
                  v-for="template in filteredTemplates"
                  :key="template.id"
                  class="autocomplete-item"
                  @click="selectTemplate(template)"
                >
                  {{ template.name }}
                </div>
              </div>
              <div v-if="!selectedTemplate && showTemplateError" class="error-message">
                未找到指定模板
              </div>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label required">
              提交方式：
            </label>
            <div class="radio-group">
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="submitMethod"
                  value="web"
                  :disabled="!selectedTemplate"
                />
                <span>网页提交</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="submitMethod"
                  value="file"
                  :disabled="!selectedTemplate"
                />
                <span>文件提交</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="selectedTemplate && submitMethod === 'web'" class="submit-form-section">
          <h2 class="section-title">数据表单</h2>
          <div class="form-fields">
            <SchemaForm
              v-if="currentSchema"
              v-model="formData"
              :schema="currentSchema"
              :word-order="currentWordOrder"
            />
            <div v-else class="no-template-hint">
              请先选择模板以生成表单
            </div>
          </div>

          <div class="form-actions">
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
              @click="submitData"
            >
              {{ isSubmitting ? '提交中...' : '提交数据' }}
            </button>
          </div>
        </div>

        <div v-else-if="selectedTemplate && submitMethod === 'file'" class="file-submit-section">
          <h2 class="section-title">文件提交</h2>
          <div class="file-upload-area">
            <div class="upload-box">
              <div class="upload-icon">📁</div>
              <p class="upload-text">请上传包含数据的文件</p>
              <p class="upload-hint">支持 Excel、JSON 等格式</p>
              <input
                type="file"
                class="file-input-hidden"
                ref="fileInputRef"
                @change="handleDataFileUpload"
                accept=".xlsx,.xls,.json,.csv"
              />
              <button class="btn btn-primary" @click="triggerFileInput">
                选择文件
              </button>
            </div>

            <div v-if="uploadedDataFile" class="uploaded-file-info">
              <div class="file-info-card">
                <div class="file-icon">📄</div>
                <div class="file-details">
                  <p class="file-name">{{ uploadedDataFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(uploadedDataFile.size) }}</p>
                </div>
                <button class="btn-remove" @click="clearDataFile">✕</button>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="parseAndSwitch"
                >
                  解析并切换到网页提交
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                  @click="submitDataFile"
                >
                  {{ isSubmitting ? '提交中...' : '直接提交' }}
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
        <p>数据ID: {{ createdDataId }}</p>
        <div class="success-actions">
          <button class="btn btn-primary" @click="goToDataDetail">
            查看数据
          </button>
          <button class="btn btn-secondary" @click="createAnother">
            继续上传
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import MainAppBar from "@/components/MainAppBar.vue";
import SchemaForm from "@/components/SchemaForm.vue";
import TemplateService, { TemplateNameData } from "@/api/TemplateService";
import DevelopmentDataService from "@/api/DevelopmentDataService";

const router = useRouter();

interface Template {
  id: string;
  name: string;
}

const searchKeyword = ref("");
const selectedTemplate = ref<Template | null>(null);
const currentSchema = ref<any>(null);
const currentWordOrder = ref<any>(null);
const submitMethod = ref("");
const showTemplateList = ref(false);
const showTemplateError = ref(false);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const createdDataId = ref("");
const uploadedFiles = ref<File[]>([]);
const uploadedDataFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const templateList = ref<Template[]>([]);

const formData = ref<any>({});

// 监听搜索关键词变化，调用API获取模板列表
watch(searchKeyword, async (newKeyword) => {
  if (!newKeyword) {
    templateList.value = [];
    return;
  }
  
  // 简单的防抖
  if (newKeyword.length < 1) return;

  try {
    const res = await TemplateService.getTemplateListWithBegin(newKeyword);
    if (res && res.name_list) {
      templateList.value = res.name_list.map(name => ({
        name: name,
        id: res.name_dict[name]
      }));
    }
  } catch (error) {
    console.error("Failed to fetch templates", error);
  }
});

const filteredTemplates = computed(() => {
  return templateList.value;
});

const handleTemplateSearch = () => {
  showTemplateList.value = true;
  showTemplateError.value = false;
};

const handleTemplateBlur = () => {
  setTimeout(() => {
    showTemplateList.value = false;
  }, 200);
};

const selectTemplate = async (template: Template) => {
  selectedTemplate.value = template;
  searchKeyword.value = template.name;
  showTemplateList.value = false;
  showTemplateError.value = false;
  
  try {
    const schema = await TemplateService.getTemplateSchemaWithId(template.id);
    currentSchema.value = schema;
    
    const wordOrder = await TemplateService.getTemplateWordOrderWithId(template.id);
    currentWordOrder.value = wordOrder;

    formData.value = {}; // Reset form data
  } catch (e) {
    console.error("Failed to fetch template schema", e);
    alert("获取模板定义失败");
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    uploadedFiles.value = Array.from(target.files);
  }
};

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleDataFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    uploadedDataFile.value = target.files[0];
  }
};

const clearDataFile = () => {
  uploadedDataFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const parseAndSwitch = async () => {
  if (!uploadedDataFile.value) return;
  
  try {
    const text = await uploadedDataFile.value.text();
    const json = JSON.parse(text);
    formData.value = json;
    console.log("Parsed JSON:", json);
    
    submitMethod.value = 'web';
    alert('文件已解析，切换到网页提交模式');
  } catch (e) {
    alert("文件解析失败，请确保是有效的 JSON 文件");
  }
};

const saveDraft = async () => {
  if (!selectedTemplate.value) return;
  
  isSubmitting.value = true;
  try {
    await DevelopmentDataService.createDevelopmentData(
      selectedTemplate.value.id,
      JSON.stringify(formData.value),
      "draft" // 草稿状态
    );
    alert("草稿保存成功!");
  } catch (error) {
    alert("保存失败");
  } finally {
    isSubmitting.value = false;
  }
};

const submitData = async () => {
  if (!selectedTemplate.value) {
    alert("请选择模板");
    return;
  }
  if (Object.keys(formData.value).length === 0) {
    alert("请填写表单数据");
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await DevelopmentDataService.createDevelopmentData(
      selectedTemplate.value.id,
      JSON.stringify(formData.value),
      "waiting_review"
    );
    
    if (res.status === 0) {
      createdDataId.value = res.data?.id || "UNKNOWN";
      showSuccess.value = true;
    } else {
      alert("提交失败: " + res.status);
    }
  } catch (error) {
    console.error(error);
    alert("提交失败");
  } finally {
    isSubmitting.value = false;
  }
};

const submitDataFile = async () => {
  if (!uploadedDataFile.value) {
    alert("请选择文件");
    return;
  }
  if (!selectedTemplate.value) {
    alert("请选择模板");
    return;
  }

  isSubmitting.value = true;
  try {
    const text = await uploadedDataFile.value.text();
    // 验证 JSON
    JSON.parse(text);
    
    const res = await DevelopmentDataService.createDevelopmentDataFromFile(
      selectedTemplate.value.id,
      text,
      "waiting_review"
    );

    if (res.status === 0) {
      createdDataId.value = res.data?.id || "UNKNOWN";
      showSuccess.value = true;
    } else {
      alert("提交失败: " + res.status);
    }
  } catch (error) {
    console.error(error);
    alert("提交失败: 文件格式错误或网络问题");
  } finally {
    isSubmitting.value = false;
  }
};

const goToDataDetail = () => {
  router.push(`/development_data/detail/${createdDataId.value}`);
};

const createAnother = () => {
  showSuccess.value = false;
  selectedTemplate.value = null;
  searchKeyword.value = "";
  submitMethod.value = "";
  formData.value = {};
  uploadedFiles.value = [];
  uploadedDataFile.value = null;
};
</script>

<style scoped>
.development-create-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 94px 20px 40px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  max-width: 550px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 22px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  min-width: 100px;
  padding-top: 10px;
  display: block;
}

.form-label.required::before {
  content: "* ";
  color: #f44336;
}

.form-input-wrapper {
  flex: 1;
  position: relative;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: #3f51b5;
}

.autocomplete-input {
  width: 430px;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.autocomplete-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.autocomplete-item:hover {
  background-color: #f5f5f5;
}

.radio-group {
  display: flex;
  gap: 40px;
  padding-top: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-label input[type="radio"]:disabled {
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
}

.submit-form-section,
.file-submit-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #f0f0f0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

.form-fields .form-row {
  display: block;
  margin-bottom: 20px;
}

.form-fields .form-label {
  display: block;
  min-width: auto;
  padding-top: 0;
  margin-bottom: 8px;
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.form-textarea {
  resize: vertical;
}

.form-file-input {
  display: block;
  width: 100%;
  padding: 8px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.file-list {
  margin-top: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-remove {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 13px;
}

.file-upload-area {
  text-align: center;
}

.upload-box {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 60px 40px;
  background-color: #fafafa;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.file-input-hidden {
  display: none;
}

.uploaded-file-info {
  margin-top: 24px;
}

.file-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 24px;
}

.file-icon {
  font-size: 32px;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-details .file-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.file-details .file-size {
  font-size: 14px;
  color: #666;
}

.btn-remove {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-remove:hover {
  color: #f44336;
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
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
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

.btn-secondary:hover:not(:disabled) {
  background-color: #616161;
}

.btn-outline {
  background-color: white;
  color: #3f51b5;
  border: 1px solid #3f51b5;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f5f5f5;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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
  color: #333;
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

