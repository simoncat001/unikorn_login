<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <MainAppBar />
    
    <!-- 首页Logo和标题 -->
    <div class="outer-container">
      <div class="icon-content-container">
        <!-- 左边图片 -->
        <img
          src="/homelogo.png"
          alt="首页图标"
          class="logo-image"
        />
        <!-- 右边文字 -->
        <div>
          <h1 class="main-title">材料科学标准管理数据库</h1>
        </div>
      </div>
    </div>

    <!-- 搜索栏区域 -->
    <div class="search-container">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索词条、模板、数据..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-button" @click="handleSearch">
          搜索
        </button>
      </div>
      
      <!-- 搜索类型选择 -->
      <div class="search-filters">
        <label class="filter-checkbox">
          <input type="checkbox" v-model="searchFilters.word" />
          <span>词条</span>
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="searchFilters.template" />
          <span>模板</span>
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="searchFilters.studydata" />
          <span>开发数据</span>
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="searchFilters.MGID" />
          <span>MGID</span>
        </label>
      </div>
    </div>

    <!-- 数据资源标签 -->
    <div class="section-label">
      <h3>数据资源</h3>
    </div>

    <!-- 数据卡片 -->
    <div class="cards-container">
      <div class="card">
        <h3>词条</h3>
        <p>材料基因组相关词条和概念</p>
        <RouterLink :to="paths.WORDS_CREATE_PATH" class="card-link">创建词条</RouterLink>
      </div>
      <div class="card">
        <h3>模板</h3>
        <p>数据模板和标准规范</p>
        <RouterLink :to="paths.TEMPLATES_CREATE_PATH" class="card-link">创建模板</RouterLink>
      </div>
      <div class="card">
        <h3>开发数据</h3>
        <p>实验和计算数据</p>
        <RouterLink :to="paths.DEVELOPMENT_DATA_CREATE_PATH" class="card-link">上传数据</RouterLink>
      </div>
      <div class="card">
        <h3>应用数据集</h3>
        <p>应用级数据集合</p>
        <RouterLink :to="paths.APPLICATION_DATA_CREATE_PATH" class="card-link">上传数据</RouterLink>
      </div>
    </div>

    <!-- 服务资源标签 -->
    <div class="section-label">
      <h3>服务资源</h3>
    </div>

    <!-- 服务卡片 -->
    <div class="cards-container">
      <div class="card">
        <h3>MGID申请</h3>
        <p>申请材料基因组唯一标识符</p>
        <RouterLink :to="paths.MGID_APPLY_CREATE_PATH" class="card-link">申请MGID</RouterLink>
      </div>
      <div class="card">
        <h3>数据上传</h3>
        <p>批量上传和分片上传</p>
        <RouterLink :to="paths.DEVELOPMENT_DATA_MULYIPART_UPLOAD_PATH" class="card-link">分片上传</RouterLink>
      </div>
      <div class="card">
        <h3>管理后台</h3>
        <p>数据管理和审核</p>
        <RouterLink :to="`${paths.ADMIN_PATH}/words`" class="card-link">进入管理</RouterLink>
      </div>
    </div>

    <!-- 页脚版权信息 -->
    <footer class="footer">
      <p>
        <a href="https://beian.miit.gov.cn/" target="_blank" class="footer-link">
          沪交ICP备20210259
        </a>
      </p>
      <p class="copyright">
        © {{ currentYear }} Materials Genome Standard Database, All rights reserved.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from "vue-router";
import MainAppBar from "../components/MainAppBar.vue";
import * as paths from "../router/paths";

const searchQuery = ref('');
const searchFilters = ref({
  word: true,
  template: false,
  studydata: false,
  MGID: false
});

const currentYear = computed(() => new Date().getFullYear());

const handleSearch = () => {
  console.log('搜索:', searchQuery.value, searchFilters.value);
  // TODO: 实现搜索功能
};
</script>

<style scoped>
.home-container {
  margin: 0;
  padding: 0;
  max-width: 100%;
  min-width: 600px;
  min-height: 950px;
}

.outer-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-content-container {
  display: flex;
  align-items: center;
  max-width: 800px;
  margin: 80px 50px 40px 50px;
}

.logo-image {
  width: 128px;
  height: 128px;
  margin-right: 10px;
}

@media (max-width: 600px) {
  .logo-image {
    width: 100px;
    height: 100px;
  }
}

.main-title {
  font-size: 46px;
  font-weight: 530;
  margin: 0;
  text-align: center;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.sub-title {
  font-size: 26px;
  font-weight: 530;
  margin: 8px 0 0 0;
  text-align: center;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.search-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.search-button:hover {
  background-color: #2563eb;
}

.search-filters {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.filter-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.section-label {
  max-width: 1200px;
  margin: 60px auto 20px auto;
  padding: 0 20px;
}

.section-label h3 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto 40px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.card {
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.card p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.card-link {
  display: inline-block;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  text-decoration: none;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.card-link:hover {
  background-color: #3b82f6;
  color: white;
}

.footer {
  text-align: center;
  padding: 24px 20px;
  margin-top: 60px;
  border-top: 1px solid #e5e7eb;
}

.footer p {
  margin: 8px 0;
  font-size: 14px;
  color: #6b7280;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.footer-link {
  color: #6b7280;
  text-decoration: none;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.footer-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.copyright {
  color: #9ca3af;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
</style>
