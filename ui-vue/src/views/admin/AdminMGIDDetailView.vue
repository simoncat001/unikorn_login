<template>
  <div class="page-container">
    <MainAppBar />
    <div class="main-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">加载中...</div>
      </div>

      <div v-else-if="mgidItem" class="detail-container">
        <!-- Top Controls: Citation -->
        <div class="top-controls">
          <div class="citation-wrapper">
            <button class="btn-secondary" @click="copyCitation">引用</button>
            <div v-if="showCopiedAlert" class="copied-alert">已粘贴到剪切板</div>
          </div>
        </div>

        <!-- Header: Title and Creator Info -->
        <div class="header-row">
          <div class="title-section">
            <div class="admin-title">
              <span class="title-text">{{ mgidItem.json_data.data_title }}</span>
              <span class="type-tag">MGID</span>
            </div>
          </div>
          <div class="creator-info">
            <div class="creator-row">
              <span class="label">提交人：</span>
              <span class="value">{{ mgidItem.json_data.author_name }}</span>
            </div>
            <div class="creator-row">
              <span class="label">创建时间：</span>
              <span class="value">{{ mgidItem.json_data.create_timestamp }}</span>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="section-divider">
          <span class="divider-text">审核内容</span>
          <div class="divider-line"></div>
        </div>

        <!-- Info Content -->
        <div class="info-content">
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.data_title }}：</div>
            <div class="info-value">{{ mgidItem.json_data.data_title }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.author_name }}：</div>
            <div class="info-value">{{ mgidItem.json_data.author_name }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.author_organization }}：</div>
            <div class="info-value">{{ mgidItem.json_data.author_organization }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.abstract }}：</div>
            <div class="info-value">{{ mgidItem.json_data.abstract }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.source_type }}：</div>
            <div class="info-value">{{ sourceTypeMap[mgidItem.json_data.source_type] || mgidItem.json_data.source_type }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.data_url }}：</div>
            <div class="info-value">
              <a :href="getClickableLink(mgidItem.json_data.data_url)" target="_blank" class="link">
                {{ mgidItem.json_data.data_url }}
              </a>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ MGIDItemMap.MGID }}：</div>
            <div class="info-value">{{ mgidItem.json_data.MGID }}</div>
          </div>
        </div>

        <!-- Review Section -->
        <div class="review-section">
          <div class="review-form">
            <div class="form-group-row">
              <div class="form-label">审核状态</div>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="reviewStatus" value="passed" />
                  <span>通过</span>
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="reviewStatus" value="rejected" />
                  <span>拒绝</span>
                </label>
              </div>
            </div>
            <div class="form-group-row">
              <div class="form-label">审核意见</div>
              <div class="input-wrapper">
                <textarea v-model="reviewComment" rows="4" class="review-textarea"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-primary" @click="handleSubmit" :disabled="submitting">提交审核</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-container">
        未找到数据
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
const showCopiedAlert = ref(false);

const MGIDItemMap: { [key: string]: string } = {
  data_title: "数据标题",
  author_name: "作者姓名",
  author_organization: "作者单位",
  abstract: "摘要",
  source_type: "来源类别",
  data_url: "数据URL",
  create_timestamp: "创建时间",
  MGID: "MGID",
  pubTime: "提交时间",
};

const sourceTypeMap: { [key: string]: string } = {
  S: "制备",
  T: "表征",
  D: "分析",
  M: "虚拟制备",
  C: "虚拟表征",
};

onMounted(async () => {
  try {
    const response = await MGIDApplyService.getMGID(mgid);
    if (response && response.data) {
        mgidItem.value = response.data;
        const jsonData = mgidItem.value.json_data as any;
        reviewStatus.value = jsonData.review_status === 'submitted' ? 'passed' : (jsonData.review_status || 'passed');
        reviewComment.value = jsonData.rejected_reason || '';
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const getClickableLink = (link: string) => {
  if (!link) return '';
  return link.startsWith("http://") || link.startsWith("https://")
    ? link
    : `//${link}`;
};

const copyCitation = () => {
  if (!mgidItem.value) return;
  const jsonData = mgidItem.value.json_data;
  const year = jsonData.MGID ? jsonData.MGID.split('.')[1] : new Date().getFullYear(); 
  const citationString =
    jsonData.author_name +
    "(" +
    year +
    "):" +
    jsonData.data_title +
    ",MGSDB," +
    window.location.host +
    "/MGID/" + jsonData.MGID;

  navigator.clipboard.writeText(citationString).then(() => {
    showCopiedAlert.value = true;
    setTimeout(() => {
      showCopiedAlert.value = false;
    }, 3000);
  });
};

const handleSubmit = async () => {
  if (!mgidItem.value) return;
  submitting.value = true;
  try {
    const userInfo = getUser();
    const reviewer = (userInfo && userInfo.username) ? userInfo.username : 'admin'; 
    
    const status = await AdminService.updateReview(
        mgidItem.value.id, 
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
    alert('审核提交失败');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding-top: 80px; /* Space for AppBar */
  padding-bottom: 40px;
}

.detail-container {
  width: 780px; /* Match React containerWidth */
  background-color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.top-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.citation-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-secondary {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.23);
  color: rgba(0, 0, 0, 0.87);
  padding: 4px 10px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.copied-alert {
  position: absolute;
  top: 40px;
  background-color: #4caf50;
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12);
  z-index: 10;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: flex-end;
}

.admin-title {
  display: flex;
  align-items: flex-end;
}

.title-text {
  font-size: 34px; /* H4 size */
  line-height: 35px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.87);
}

.type-tag {
  font-size: 24px; /* H5 size */
  line-height: 29px;
  margin-left: 10px;
  color: rgba(0, 0, 0, 0.54); /* Light body text */
}

.creator-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 94px; /* Match React margin */
}

.creator-row {
  display: flex;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.5;
}

.section-divider {
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
}

.divider-text {
  font-size: 16px;
  color: #0056b3; /* Primary color */
  font-weight: bold;
  margin-right: 10px;
  white-space: nowrap;
}

.divider-line {
  flex-grow: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.12);
}

.info-content {
  margin-left: 80px; /* Match React boxControl margin */
  width: 700px;
}

.info-item {
  display: flex;
  min-height: 35px;
  margin-bottom: 5px;
}

.info-label {
  width: 120px;
  min-width: 120px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.87);
}

.info-value {
  flex-grow: 1;
  word-break: break-all;
  color: rgba(0, 0, 0, 0.87);
}

.link {
  color: rgba(0, 0, 0, 0.87);
  text-decoration: underline;
}

.link:hover {
  text-decoration: none;
}

.review-section {
  margin-top: 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 20px;
}

.form-group-row {
  display: flex;
  margin-bottom: 20px;
}

.form-label {
  width: 100px; /* Match React flexBasis */
  font-size: 16px;
  color: rgba(0, 0, 0, 0.54);
  padding-top: 8px;
}

.radio-group {
  display: flex;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  margin-right: 20px;
  cursor: pointer;
}

.radio-label input {
  margin-right: 5px;
}

.input-wrapper {
  flex-grow: 1;
  max-width: 600px;
}

.review-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  font-family: inherit;
  font-size: 16px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  max-width: 700px;
}

.btn-primary {
  background-color: #0056b3;
  color: white;
  border: none;
  padding: 8px 22px;
  font-size: 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #004494;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-container, .error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
