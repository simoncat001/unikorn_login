<template>
  <div class="template-create-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div class="main-content">
        <div class="form-container">
          
          <div v-if="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <div class="step-content">
            <h2 class="form-title">模板片段创建</h2>

            <div class="form-section-aligned">
              <!-- Simplified Basic Info for Fragment -->
              <div class="form-row-aligned">
                <label class="form-label-aligned required">片段标题：</label>
                <div class="form-input-wrapper">
                  <input 
                    v-model="basicInfo.title" 
                    type="text" 
                    class="form-input-styled"
                    placeholder="请输入模板片段名称"
                  />
                </div>
              </div>

              <div class="form-row-aligned">
                <label class="form-label-aligned">数据标准：</label>
                <div class="form-input-wrapper" style="position: relative;">
                  <input 
                    v-model="standardSearchQuery" 
                    type="text" 
                    class="form-input-styled"
                    placeholder="搜索并关联数据标准（选填）"
                    @input="handleStandardSearch"
                    @focus="handleStandardSearch"
                  />
                  <div v-if="showStandardDropdown && standardSearchResults.length > 0" class="search-dropdown">
                    <div 
                      v-for="std in standardSearchResults" 
                      :key="std.id" 
                      class="search-item"
                      @click="selectStandard(std)"
                    >
                      {{ std.name_zh }}
                    </div>
                  </div>
                </div>
              </div>



              <!-- Recursive Template Editor -->
              <TemplateEditor 
                :level="0" 
                :max-level="10"
                v-model:items="templateData.level0" 
              />

              <div class="form-actions-centered" style="gap: 20px;">
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
        <p>片段ID: {{ createdTemplateId }}</p>
        <div class="success-actions">
          <button class="btn btn-primary" @click="goToTemplateDetail">
            查看片段
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
import StandardService, { Standard } from "@/api/StandardService";

const router = useRouter();
const errorMessage = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);
const createdTemplateId = ref("");

const basicInfo = reactive({
  title: "",
  data_generation_method: "experiment", // Default
  unit: "上海交通大学", // Default
  platform: "MGSDB", // Default
  template_type: "sample",
  source_standard_number: "", // Default for fragment
  source_standard_name: "" // Default for fragment
});

const standardSearchQuery = ref("");
const standardSearchResults = ref<Standard[]>([]);
const showStandardDropdown = ref(false);

const handleStandardSearch = async () => {
  if (!standardSearchQuery.value) {
    standardSearchResults.value = [];
    showStandardDropdown.value = false;
    return;
  }
  try {
    standardSearchResults.value = await StandardService.searchStandards(standardSearchQuery.value);
    showStandardDropdown.value = true;
  } catch (e) {
    console.error(e);
  }
};

const selectStandard = (std: Standard) => {
  basicInfo.source_standard_name = std.name_zh;
  basicInfo.source_standard_number = std.id;
  standardSearchQuery.value = std.name_zh;
  showStandardDropdown.value = false;
};

const templateData = reactive({
  level0: [] as any[]
});



const saveDraft = async () => {
  alert("草稿保存成功!");
};

const submitForReview = async () => {
  if (!basicInfo.title) {
    errorMessage.value = "请输入片段标题";
    return;
  }
  errorMessage.value = "";
  
  isSubmitting.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  createdTemplateId.value = "FRAG_" + Date.now();
  showSuccess.value = true;
  isSubmitting.value = false;
};

const goToTemplateDetail = () => {
  // Assuming fragments share the same detail view or have a similar one
  router.push(`/templates/detail/${createdTemplateId.value}`);
};

const createAnother = () => {
  showSuccess.value = false;
  basicInfo.title = "";
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
  padding: 40px 20px;
}

.form-container {
  flex: 1;
  max-width: 900px;
  width: 100%;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 32px;
  text-align: center;
}

.form-section-aligned {
  background: white;
  padding: 0;
}

.form-row-aligned {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.form-label-aligned {
  width: 140px;
  text-align: right;
  margin-right: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.form-label-aligned.required::before {
  content: "*";
  color: #ef4444;
  margin-right: 4px;
}

.form-input-wrapper {
  flex: 1;
  max-width: 600px;
}

.form-input-styled {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input-styled:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.radio-group-horizontal {
  display: flex;
  gap: 24px;
  align-items: center;
  min-height: 42px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.form-actions-centered {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover {
  background-color: #eff6ff;
}

.error-banner {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 24px;
  text-align: center;
  font-size: 14px;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.success-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.success-icon {
  width: 64px;
  height: 64px;
  background-color: #d1fae5;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}

.search-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.search-item:hover {
  background-color: #f3f4f6;
}
</style>
