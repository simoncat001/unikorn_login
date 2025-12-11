<template>
  <div class="template-recommend-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div class="header-section">
        <h1 class="page-title">数据模板推荐</h1>
        <p class="page-subtitle">您可以输入数据的关键信息，如实验数据的设备：纳米压痕，系统将自动为您匹配模板</p>
        <p class="page-hint">
          若现有模板不合适，您可以前往
          <router-link to="/templates/create" class="create-link">创建新模板</router-link>
        </p>
      </div>

      <div class="search-container">
        <div class="search-box-wrapper">
          <input
            v-model="query"
            type="search"
            class="search-input"
            placeholder="请输入关键词搜索"
            @keyup.enter="handleSearch"
          />
          <button class="search-button" @click="handleSearch">
            搜索
          </button>
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="state.word" />
            <span>词汇</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="state.template" checked />
            <span>模板</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="state.studydata" />
            <span>学习数据</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="state.mgid" />
            <span>MGID</span>
          </label>
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
              <span class="card-type">{{ item.type }}</span>
              <h3 class="card-title">{{ item.chinese_name || item.name }}</h3>
            </div>
            <div class="card-body">
              <p class="card-description">{{ item.definition || item.description || '暂无描述' }}</p>
            </div>
            <div class="card-footer">
              <span class="card-meta">ID: {{ item.id }}</span>
            </div>
          </div>
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

const query = ref("");
const isClicked = ref(false);
const isLoading = ref(false);

const state = reactive({
  word: false,
  template: true,
  studydata: false,
  mgid: false
});

interface SearchResult {
  id: string;
  type: string;
  chinese_name?: string;
  name?: string;
  definition?: string;
  description?: string;
}

const resultList = ref<SearchResult[]>([]);

const handleSearch = async () => {
  if (!query.value.trim()) {
    return;
  }

  isClicked.value = true;
  isLoading.value = true;

  try {
    // 模拟搜索结果
    await new Promise(resolve => setTimeout(resolve, 500));
    resultList.value = [
      {
        id: "1",
        type: "模板",
        chinese_name: "纳米压痕实验模板",
        definition: "用于记录纳米压痕实验的标准数据模板"
      },
      {
        id: "2",
        type: "模板",
        chinese_name: "材料性能测试模板",
        definition: "材料力学性能测试的数据记录模板"
      }
    ];
  } catch (error) {
    console.error("搜索失败:", error);
    resultList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const navigateToDetail = (item: SearchResult) => {
  if (item.type === "模板") {
    router.push(`/templates/detail/${item.id}`);
  } else if (item.type === "词汇") {
    router.push(`/words/detail/${item.id}`);
  }
};
</script>

<style scoped>
.template-recommend-page {
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
  margin-left: 4px;
}

.create-link:hover {
  color: #303f9f;
}

.search-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  max-width: 572px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  flex: 1;
  height: 44px;
  padding: 0 20px;
  border: 1px solid #ddd;
  border-top-left-radius: 22px;
  border-bottom-left-radius: 22px;
  border-right: none;
  font-size: 14px;
  outline: none;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.search-input:focus {
  border-color: #3f51b5;
}

.search-button {
  width: 82px;
  height: 44px;
  background-color: #063E8B;
  color: white;
  border: none;
  border-top-right-radius: 22px;
  border-bottom-right-radius: 22px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.search-button:hover {
  background-color: #052d6b;
}

.checkbox-group {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
}

.results-container {
  min-height: 400px;
}

.placeholder,
.loading,
.no-results {
  text-align: center;
  padding: 80px 20px;
  color: #999;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 12px;
}

.card-type {
  display: inline-block;
  padding: 2px 8px;
  background-color: #e3f2fd;
  color: #1976d2;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 8px 0;
}

.card-body {
  margin-bottom: 12px;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-meta {
  font-size: 12px;
  color: #999;
}
</style>
