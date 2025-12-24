<template>
  <div class="admin-detail-layout">
    <MainAppBar />

    <div class="main-content">
      <div class="detail-container">
        <div class="header">
          <div>
            <p class="eyebrow">管理台</p>
            <h2>词条审核 #{{ id }}</h2>
            <p class="muted">审阅词条内容并通过或驳回。</p>
          </div>

          <button class="btn" type="button" @click="router.back()">返回</button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="loadError" class="error">{{ loadError }}</div>

        <template v-else>
          <div v-if="!word" class="empty">未找到该词条</div>

          <div v-else class="content">
            <section class="section">
              <h3>基本信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>编号</label>
                  <span>{{ word.json_data?.serial_number }}</span>
                </div>
                <div class="info-item">
                  <label>中文名称</label>
                  <span>{{ word.json_data?.chinese_name }}</span>
                </div>
                <div class="info-item">
                  <label>英文名称</label>
                  <span>{{ word.json_data?.english_name }}</span>
                </div>
                <div class="info-item">
                  <label>缩写</label>
                  <span>{{ word.json_data?.abbr }}</span>
                </div>
                <div class="info-item full-width">
                  <label>定义</label>
                  <p class="pre">{{ word.json_data?.definition }}</p>
                </div>
              </div>
            </section>

            <section class="section">
              <h3>审核操作</h3>

              <div class="review-form">
                <div class="form-group">
                  <label>审核结果</label>
                  <div class="radio-group">
                    <label class="radio">
                      <input type="radio" v-model="reviewStatus" value="passed" />
                      <span>通过</span>
                    </label>
                    <label class="radio">
                      <input type="radio" v-model="reviewStatus" value="rejected" />
                      <span>驳回</span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label>审核意见</label>
                  <textarea
                    v-model="reviewComment"
                    rows="4"
                    placeholder="请输入审核意见（驳回建议必填）..."
                  />
                </div>

                <div class="form-actions">
                  <button class="btn primary" type="button" :disabled="submitting" @click="handleSubmit">
                    {{ submitting ? '提交中...' : '提交审核' }}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import MainAppBar from '../../components/MainAppBar.vue';
import WordService, { type Word } from '../../api/WordService';
import AdminService from '../../api/AdminService';
import { getUser } from '../../api/AuthService';

const route = useRoute();
const router = useRouter();

const id = route.params.id as string;

const loading = ref(true);
const loadError = ref<string | null>(null);
const submitting = ref(false);

const word = ref<Word | null>(null);
const reviewStatus = ref<'passed' | 'rejected'>('passed');
const reviewComment = ref('');

onMounted(async () => {
  loading.value = true;
  loadError.value = null;

  try {
    word.value = await WordService.getWord(id);

    const currentStatus = word.value?.json_data?.review_status;
    if (currentStatus === 'rejected') {
      reviewStatus.value = 'rejected';
    }
    reviewComment.value = word.value?.json_data?.rejected_reason || '';
  } catch (e) {
    console.error(e);
    loadError.value = '加载失败';
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (!word.value) return;

  if (reviewStatus.value === 'rejected' && !reviewComment.value.trim()) {
    alert('驳回时请填写审核意见');
    return;
  }

  submitting.value = true;
  try {
    const userInfo = getUser();
    const reviewer = userInfo?.username || 'admin';

    const status = await AdminService.updateReview(
      word.value.id,
      'word',
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
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-container {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eee;
}

.eyebrow {
  margin: 0 0 4px;
  color: #6b7280;
  font-size: 12px;
}

.muted {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.section {
  margin-top: 22px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 600;
  color: #4b5563;
}

.pre {
  white-space: pre-wrap;
  margin: 0;
}

.review-form {
  background: #f9fafb;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  padding: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.radio-group {
  display: flex;
  gap: 18px;
}

.radio {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
}

.btn {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.btn.primary {
  border-color: #1976d2;
  background: #1976d2;
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.error,
.empty {
  padding: 14px;
  color: #374151;
}

.error {
  color: #b91c1c;
}
</style>