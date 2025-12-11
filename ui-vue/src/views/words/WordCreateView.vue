<template>
  <MainAppBar />
  <div class="word-create-container">
    <h1 class="page-title">词汇创建</h1>
    
    <form class="word-form">
      <div class="form-control">
        <div class="form-grid">
          <!-- 中文名称 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon">*</span>中文名称：
                </p>
              </div>
              <div class="input-wrapper">
                <input
                  v-model="form.chinese_name"
                  type="text"
                  class="text-field"
                  required
                />
              </div>
            </div>
          </div>

          <!-- 英文名称 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon">*</span>英文名称：
                </p>
              </div>
              <div class="input-wrapper">
                <input
                  v-model="form.english_name"
                  type="text"
                  class="text-field"
                  required
                />
              </div>
            </div>
          </div>

          <!-- 缩写名 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon-placeholder"></span>缩写名：
                </p>
              </div>
              <div class="input-wrapper">
                <input
                  v-model="form.abbr"
                  type="text"
                  class="text-field"
                />
              </div>
            </div>
          </div>

          <!-- 定义 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon">*</span>定义：
                </p>
              </div>
              <div class="input-wrapper">
                <input
                  v-model="form.definition"
                  type="text"
                  class="text-field"
                  required
                />
              </div>
            </div>
          </div>

          <!-- 数据类型 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon">*</span>数据类型：
                </p>
              </div>
              <div class="input-wrapper">
                <select v-model="form.data_type" class="text-field select-field">
                  <option value="string">字符串</option>
                  <option value="number">数值</option>
                  <option value="number_range">数值范围</option>
                  <option value="file">文件</option>
                  <option value="date">日期</option>
                  <option value="enum_text">枚举项</option>
                  <option value="image">图片</option>
                  <option value="MGID">MGID</option>
                  <option value="object">对象</option>
                  <option value="array">数组</option>
                  <option value="list"></option>
                </select>
              </div>
            </div>
          </div>

          <!-- 来源标准号 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon">*</span>来源标准号：
                </p>
              </div>
              <div class="input-wrapper">
                <input
                  v-model="form.source_standard_id"
                  type="text"
                  class="text-field"
                  required
                />
              </div>
            </div>
          </div>

          <!-- 来源标准名称 -->
          <div class="form-item">
            <div class="form-row">
              <div class="label-box">
                <p class="label-text">
                  <span class="required-icon-placeholder"></span>来源标准名称：
                </p>
              </div>
              <div class="input-wrapper">
                <input
                  v-model="form.source_standard_name"
                  type="text"
                  class="text-field"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="button-container">
        <button type="button" class="btn-secondary" @click="saveDraft">
          保存草稿
        </button>
        <button type="button" class="btn-primary" @click="submitReview">
          提交审核
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import MainAppBar from '../../components/MainAppBar.vue';

const form = reactive({
  chinese_name: '',
  english_name: '',
  abbr: '',
  definition: '',
  data_type: 'string',
  source_standard_id: '',
  source_standard_name: ''
});

const saveDraft = () => {
  console.log('保存草稿', form);
};

const submitReview = () => {
  console.log('提交审核', form);
};
</script>

<style scoped>
.word-create-container {
  display: flex;
  flex-grow: 1;
  align-items: center;
  flex-direction: column;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 40px;
}

.page-title {
  margin-top: 94px;
  font-size: 20px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  line-height: 1.6;
  letter-spacing: 0.0075em;
}

.word-form {
  margin-top: 45px;
  width: 600px;
}

.form-control {
  width: 100%;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-item {
  margin-bottom: 10px;
  width: 100%;
}

.form-row {
  display: flex;
  align-items: flex-start;
  width: 600px;
}

.label-box {
  flex-shrink: 0;
  width: 150px;
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
}

.label-text {
  margin: 0;
  margin-top: 4px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: 0.01071em;
  text-align: right;
  color: rgba(0, 0, 0, 0.87);
}

.required-icon {
  color: #f44336;
  margin-right: 4px;
}

.required-icon-placeholder {
  display: inline-block;
  width: 8px;
  margin-right: 4px;
}

.input-wrapper {
  flex: 1;
  max-width: 434px;
}

.text-field {
  width: 100%;
  padding: 10.5px 14px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  font-size: 16px;
  line-height: 1.1876em;
  letter-spacing: 0.00938em;
  color: rgba(0, 0, 0, 0.87);
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  background-color: white;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.text-field:hover {
  border-color: rgba(0, 0, 0, 0.87);
}

.text-field:focus {
  border-color: #3f51b5;
  border-width: 2px;
  padding: 9.5px 13px;
}

.select-field {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(0,0,0,0.54)'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 7px center;
  background-size: 24px;
  padding-right: 32px;
  cursor: pointer;
}

.button-container {
  margin-top: 60px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-secondary {
  min-width: 64px;
  padding: 6px 16px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.75;
  letter-spacing: 0.02857em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.87);
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
}

.btn-secondary:hover {
  background-color: #d5d5d5;
}

.btn-primary {
  min-width: 64px;
  padding: 6px 16px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.75;
  letter-spacing: 0.02857em;
  text-transform: uppercase;
  color: white;
  background-color: #3f51b5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
  margin-left: 56px;
}

.btn-primary:hover {
  background-color: #303f9f;
}

.btn-primary:active,
.btn-secondary:active {
  box-shadow: none;
}
</style>
