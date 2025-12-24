<template>
  <div class="standard-detail-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div v-if="loading" class="loading-state">
        加载中...
      </div>
      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>
      <div v-else class="detail-container">
        <header class="detail-header">
          <div class="header-content">
            <div class="title-row">
              <h1 class="title">{{ standard?.name_zh }}</h1>
              <span :class="['status-badge', standard?.review_status]">{{ getStatusText(standard?.review_status) }}</span>
            </div>
            <p class="subtitle">{{ standard?.name_en }}</p>
          </div>
          <div class="header-actions">
            <div v-if="isAdmin && standard?.review_status === 'pending'" class="admin-actions">
              <button class="btn-approve" @click="handleStatusUpdate('approved')">通过</button>
              <button class="btn-reject" @click="handleStatusUpdate('rejected')">拒绝</button>
            </div>
            <button class="btn-back" @click="goBack">返回列表</button>
          </div>
        </header>

        <div class="pdf-viewer-container">
          <div class="toolbar">
            <a v-if="pdfUrl" :href="pdfUrl" download class="btn-download" target="_blank">
              下载 PDF
            </a>
            <span class="debug-info">URL: {{ pdfUrl }}</span>
          </div>
          <iframe 
            v-if="pdfUrl" 
            :src="pdfUrl" 
            class="pdf-iframe"
            title="PDF Viewer"
          ></iframe>
          <div v-else class="no-file">
            <p>无法加载文件</p>
            <p style="font-size: 12px; opacity: 0.7; margin-top: 8px;">
              File URL: {{ standard?.file_url || 'Empty' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainAppBar from '@/components/MainAppBar.vue';
import StandardService, { Standard } from '@/api/StandardService';
import { getFileDownloadUrl } from '@/api/config';
import { getUser } from '@/api/AuthService';

const route = useRoute();
const router = useRouter();
const standardId = route.params.id as string;

const standard = ref<Standard | null>(null);
const loading = ref(true);
const error = ref('');
const pdfUrl = ref('');

const isAdmin = computed(() => {
  const user = getUser();
  return user?.user_type === 'admin';
});

const getStatusText = (status?: string) => {
  switch (status) {
    case 'pending': return '待审核';
    case 'approved': return '已发布';
    case 'rejected': return '已拒绝';
    default: return status || '未知';
  }
};

const handleStatusUpdate = async (status: string) => {
  if (!standard.value) return;
  try {
    const updated = await StandardService.updateStandardStatus(standard.value.id, status);
    standard.value = updated;
    alert(status === 'approved' ? '已通过审核' : '已拒绝发布');
  } catch (e) {
    console.error(e);
    alert('操作失败');
  }
};

onMounted(async () => {
  if (!standardId) {
    error.value = '无效的标准ID';
    loading.value = false;
    return;
  }

  try {
    const data = await StandardService.getStandard(standardId);
    standard.value = data;
    if (data.file_url) {
      pdfUrl.value = getFileDownloadUrl(data.file_url);
    }
  } catch (e) {
    console.error(e);
    error.value = '获取标准详情失败';
  } finally {
    loading.value = false;
  }
});

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.standard-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-state {
  color: #d32f2f;
}

.detail-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  min-height: 600px;
}

.detail-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  background: #999;
}

.status-badge.pending { background: #ff9800; }
.status-badge.approved { background: #4caf50; }
.status-badge.rejected { background: #f44336; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-actions {
  display: flex;
  gap: 8px;
}

.btn-approve {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-reject {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

.btn-back {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #f5f5f5;
}

.pdf-viewer-container {
  flex: 1;
  background: #525659; /* Standard PDF viewer background color */
  position: relative;
  display: flex;
  flex-direction: column;
}

.toolbar {
  background: #333;
  color: white;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-download {
  background: #4CAF50;
  color: white;
  padding: 5px 15px;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
}

.debug-info {
  font-size: 12px;
  color: #aaa;
  margin-left: auto;
}

.pdf-iframe {
  flex: 1;
  width: 100%;
  border: none;
  display: block;
}

.no-file {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 16px;
}
</style>
