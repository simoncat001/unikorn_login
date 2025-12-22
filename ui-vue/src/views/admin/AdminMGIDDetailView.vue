<template>
  <div class="admin-detail-layout">
    <MainAppBar />
    <div class="main-content">
      <div class="detail-container">
        <div class="header">
          <h2>MGID 申请审核</h2>
          <button @click="router.back()">返回</button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="mgidItem" class="content">
          <div class="info-section">
            <h3>基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>MGID</label>
                <span>{{ mgidItem.json_data.MGID }}</span>
              </div>
              <div class="info-item">
                <label>数据标题</label>
                <span>{{ mgidItem.json_data.data_title }}</span>
              </div>
              <div class="info-item">
                <label>申请人</label>
                <span>{{ mgidItem.json_data.author_name }}</span>
              </div>
              <div class="info-item">
                <label>所属机构</label>
                <span>{{ mgidItem.json_data.author_organization }}</span>
              </div>
              <div class="info-item full-width">
                <label>摘要</label>
                <p>{{ mgidItem.json_data.abstract }}</p>
              </div>
              <div class="info-item full-width">
                <label>数据链接</label>
                <a :href="mgidItem.json_data.data_url" target="_blank">{{ mgidItem.json_data.data_url }}</a>
              </div>
            </div>
          </div>

          <div class="review-section">
            <h3>审核操作</h3>
            <div class="review-form">
              <div class="form-group">
                <label>审核结果</label>
                <div class="radio-group">
                  <label>
                    <input type="radio" v-model="reviewStatus" value="passed" /> 通过
                  </label>
                  <label>
                    <input type="radio" v-model="reviewStatus" value="rejected" /> 拒绝
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label>审核意见</label>
                <textarea v-model="reviewComment" rows="4" placeholder="请输入审核意见..."></textarea>
              </div>
              <div class="form-actions">
                <button class="btn-primary" @click="handleSubmit" :disabled="submitting">提交审核</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainAppBar from '../../components/MainAppBar.vue';
import MGIDApplyService, { MGIDApply } from '../../api/MGIDApplyService';
import AdminService from '../../api/AdminService';
import { getUser } from '../../api/AuthService';

const route = useRoute();
const router = useRouter();
const mgid = route.params.MGID as string;

const loading = ref(true);
const submitting = ref(false);
const mgidItem = ref<MGIDApply | null>(null);
const reviewStatus = ref('passed');
const reviewComment = ref('');

onMounted(async () => {
  try {
    const response = await MGIDApplyService.getMGID(mgid);
    if (response && response.data) {
        mgidItem.value = response.data;
        // MGIDApplyJSON might not have review_status, check if it exists
        // If not, default to 'submitted' or check if there's a way to get status
        // Assuming it's in json_data like others
        const jsonData = mgidItem.value.json_data as any;
        reviewStatus.value = jsonData.review_status === 'submitted' ? 'passed' : (jsonData.review_status || 'passed');
        reviewComment.value = jsonData.rejected_reason || '';
    }
  } catch (e) {
    console.error(e);
    alert('加载失败');
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (!mgidItem.value) return;
  
  submitting.value = true;
  try {
    const userInfo = getUser();
    const reviewer = (userInfo && userInfo.username) ? userInfo.username : 'admin'; 
    
    const status = await AdminService.updateReview(
      mgidItem.value.id, // Use UUID for update
      'MGID',
      reviewer,
      reviewStatus.value,
      reviewComment.value
    );
    
    if (status === 0) {
      alert('审核提交成功');
      router.back();
    } else {
      alert('审核提交失败');
    }
  } catch (e) {
    console.error(e);
    alert('提交出错');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.admin-detail-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.info-section, .review-section {
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item label {
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}

.review-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.radio-group {
  display: flex;
  gap: 20px;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
