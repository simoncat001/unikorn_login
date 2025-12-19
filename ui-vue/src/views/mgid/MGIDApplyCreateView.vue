<template>
  <div class="page-container">
    <MainAppBar />
    <div class="mgid-apply-container">
      <div class="header">
        <h1>MGID申请</h1>
      </div>
      <form @submit.prevent="handleSubmit" class="apply-form">
        <!-- Data Title -->
        <div class="form-row">
          <div class="label-col">
            <label><span class="required">*</span>数据标题：</label>
          </div>
          <div class="input-col">
            <input v-model="formData.data_title" required type="text" class="form-input" />
          </div>
        </div>

        <!-- Author Name -->
        <div class="form-row">
          <div class="label-col">
            <label><span class="required">*</span>作者姓名：</label>
          </div>
          <div class="input-col">
            <input v-model="formData.author_name" required type="text" class="form-input" />
          </div>
        </div>

        <!-- Author Organization (Autocomplete) -->
        <div class="form-row">
          <div class="label-col">
            <label><span class="required">*</span>作者单位：</label>
          </div>
          <div class="input-col relative">
            <input 
              v-model="formData.author_organization" 
              required 
              type="text" 
              class="form-input" 
              @input="handleOrgInput"
              @focus="showOrgDropdown = true"
              @blur="handleOrgBlur"
            />
            <ul v-if="showOrgDropdown && orgSuggestions.length > 0" class="autocomplete-dropdown">
              <li v-for="org in orgSuggestions" :key="org" @mousedown="selectOrg(org)">
                {{ org }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Abstract -->
        <div class="form-row top-align">
          <div class="label-col">
            <label><span class="required">*</span>摘要：</label>
          </div>
          <div class="input-col">
            <textarea v-model="formData.abstract" required rows="4" class="form-input"></textarea>
          </div>
        </div>

        <!-- Source Type -->
        <div class="form-row">
          <div class="label-col">
            <label><span class="required">*</span>来源类别：</label>
          </div>
          <div class="input-col">
            <select v-model="formData.source_type" required class="form-select">
              <option value="S">制备</option>
              <option value="T">表征</option>
              <option value="D">分析</option>
              <option value="M">虚拟制备</option>
              <option value="C">虚拟表征</option>
            </select>
          </div>
        </div>

        <!-- Data URL -->
        <div class="form-row">
          <div class="label-col">
            <label><span class="required">*</span>数据URL：</label>
          </div>
          <div class="input-col">
            <input v-model="formData.data_url" required type="text" class="form-input" />
          </div>
        </div>

        <!-- Custom Field -->
        <div class="form-row">
          <div class="label-col">
            <label><span class="required">*</span>自定义部分：</label>
          </div>
          <div class="input-col">
            <input 
              v-model="formData.custom_field" 
              required 
              type="text" 
              inputmode="numeric"
              class="form-input" 
              placeholder="填入四位数字 *"
              @input="validateCustomField"
            />
            <div v-if="customFieldError" class="error-text">{{ customFieldError }}</div>
          </div>
        </div>

        <div class="button-row">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">提交申请</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import MGIDApplyService from "../../api/MGIDApplyService";
import OrganizationService from "../../api/OrganizationService";
import MainAppBar from "../../components/MainAppBar.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const formData = reactive({
  data_title: "",
  author_name: "",
  author_organization: "",
  abstract: "",
  source_type: "S",
  data_url: "",
  custom_field: ""
});

const isSubmitting = ref(false);
const customFieldError = ref("");

// Autocomplete logic
const orgSuggestions = ref<string[]>([]);
const showOrgDropdown = ref(false);

const handleOrgInput = async () => {
  if (formData.author_organization.length > 0) {
    try {
      const list = await OrganizationService.getOrganizationListListWithBegin(formData.author_organization);
      orgSuggestions.value = list;
      showOrgDropdown.value = true;
    } catch (e) {
      console.error(e);
    }
  } else {
    orgSuggestions.value = [];
  }
};

const selectOrg = (org: string) => {
  formData.author_organization = org;
  showOrgDropdown.value = false;
};

const handleOrgBlur = () => {
  // Delay hiding to allow click event on dropdown item
  setTimeout(() => {
    showOrgDropdown.value = false;
  }, 200);
};

const validateCustomField = () => {
  const val = formData.custom_field;
  // Allow only digits
  formData.custom_field = val.replace(/\D/g, "").slice(0, 4);
  
  if (formData.custom_field.length !== 4) {
    customFieldError.value = "必须填入四位数字";
  } else {
    customFieldError.value = "";
  }
};

const handleSubmit = async () => {
  validateCustomField();
  if (customFieldError.value) return;

  isSubmitting.value = true;
  try {
    // Prepare JSON data string as backend expects
    const jsonData = JSON.stringify(formData);
    await MGIDApplyService.createMGIDApply(jsonData);
    alert("申请提交成功！");
    // Reset form
    formData.data_title = "";
    formData.author_name = "";
    formData.author_organization = "";
    formData.abstract = "";
    formData.source_type = "S";
    formData.data_url = "";
    formData.custom_field = "";
  } catch (e) {
    console.error(e);
    alert("提交失败，请重试。");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.mgid-apply-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
  flex: 1;
}

.header h1 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 45px;
  margin-top: 20px;
  color: rgba(0, 0, 0, 0.87);
}

.apply-form {
  width: 600px;
}

.form-row {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.form-row.top-align {
  align-items: flex-start;
}

.label-col {
  width: 110px;
  padding-right: 13px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.top-align .label-col {
  align-items: flex-start;
  padding-top: 5px;
}

.label-col label {
  font-weight: bold;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.required {
  color: rgb(229, 93, 63);
  margin-right: 4px;
  line-height: 1;
  padding-top: 3px;
}

.input-col {
  flex: 1;
  position: relative;
}

.form-input, .form-select {
  width: 100%;
  height: 32px;
  padding: 0 11px;
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: white;
  outline: none;
}

.form-input:focus, .form-select:focus {
  border-color: #3f51b5;
  border-width: 2px;
  padding: 0 10px; /* Adjust padding to prevent layout shift with thicker border */
}

textarea.form-input {
  height: auto;
  padding: 8px;
  font-family: inherit;
}

.button-row {
  margin-top: 60px;
  display: flex;
  justify-content: center;
}

.submit-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 6px 16px;
  font-size: 0.875rem;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 500;
  line-height: 1.75;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

.submit-btn:hover {
  background-color: #115293;
  box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}

.submit-btn:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
  box-shadow: none;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.autocomplete-dropdown li {
  padding: 8px 10px;
  cursor: pointer;
}

.autocomplete-dropdown li:hover {
  background-color: #f5f5f5;
}

.error-text {
  color: red;
  font-size: 0.8rem;
  margin-top: 4px;
}

.relative {
  position: relative;
}
</style>
