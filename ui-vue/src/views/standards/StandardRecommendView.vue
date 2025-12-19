<template>
  <div class="standard-recommend-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div class="header-section">
        <h1 class="page-title">数据标准推荐</h1>
        <p class="page-subtitle">您可以输入标准的关键信息，如标准名称，系统将自动为您匹配相关标准</p>
        <p class="page-hint">
          若现有标准不合适，您可以前往
          <router-link to="/standards/upload" class="create-link">上传新标准</router-link>
        </p>
      </div>

      <div class="search-container">
        <div class="search-box-wrapper">
          <input
            v-model="query"
            type="search"
            class="search-input"
            placeholder="请输入关键词搜索标准"
            @keyup.enter="handleSearch"
          />
          <button class="search-button" @click="handleSearch">
            搜索
          </button>
        </div>
      </div>

      <div class="results-container">
        <div v-if="!isClicked" class="placeholder">
          <p>输入关键词并点击搜索查看结果</p>
        </div>
        
        <div v-else-if="isLoading" class="loading">
          <p>加载中...</p>
        </div>
        
        <div v-else-if="resultList.length === 0" class="no-results">
          <p>未找到相关结果</p>
        </div>
        
        <div v-else class="results-grid">
          <div
            v-for="(item, index) in resultList"
            :key="index"
            class="result-card"
            @click="navigateToDetail(item)"
          >
            <div class="card-header">
              <span class="card-type">标准</span>
              <h3 class="card-title">{{ item.name_zh }}</h3>
            </div>
            <div class="card-body">
              <p class="card-description">{{ item.name_en || '暂无英文名称' }}</p>
            </div>
            <div class="card-footer">
              <span class="card-meta">状态: {{ getStatusText(item.review_status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import MainAppBar from "@/components/MainAppBar.vue";
import StandardService, { Standard } from "@/api/StandardService";

const router = useRouter();

const query = ref("");
const isClicked = ref(false);
const isLoading = ref(false);

const resultList = ref<Standard[]>([]);

const handleSearch = async () => {
  if (!query.value.trim()) {
    return;
  }

  isClicked.value = true;
  isLoading.value = true;

  try {
    const results = await StandardService.searchStandards(query.value);
    resultList.value = results;
  } catch (error) {
    console.error("搜索失败:", error);
    resultList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const navigateToDetail = (item: Standard) => {
  router.push(`/standards/detail/${item.id}`);
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'pending': return '待审核';
    case 'approved': return '已发布';
    case 'rejected': return '已拒绝';
    default: return status || '未知';
  }
};
</script>

<style scoped>
.standard-recommend-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.content-wrapper {
  max-width: 1000px;
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
  margin-bottom: 20px;
}

.page-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.5;
}

.page-hint {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.create-link {
  color: #3f51b5;
  text-decoration: underline;
  cursor: pointer;
}

.search-container {
  max-width: 800px;
  margin: 0 auto 40px;
}

.search-box-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  height: 48px;
  padding: 0 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3f51b5;
}

.search-button {
  width: 100px;
  height: 48px;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #303f9f;
}

.results-container {
  min-height: 200px;
}

.placeholder, .loading, .no-results {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 16px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.result-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.card-type {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.card-body {
  margin-bottom: 16px;
}

.card-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.card-meta {
  font-size: 12px;
  color: #999;
}
</style>
