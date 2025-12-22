<template><template>

  <div class="admin-detail-layout">  <section class="stack">

    <MainAppBar />    <header class="section-header">

    <div class="main-content">      <div>

      <div class="detail-container">        <p class="eyebrow">管理台</p>

        <div class="header">        <h2>词条审核 #{{ id }}</h2>

          <h2>词条审核</h2>        <p class="muted">审阅词条内容并通过或驳回。</p>

          <button @click="router.back()">返回</button>      </div>

        </div>      <div class="actions">

        <button class="secondary" type="button">驳回</button>

        <div v-if="loading" class="loading">加载中...</div>        <button class="primary" type="button">通过</button>

        <div v-else-if="word" class="content">      </div>

          <div class="info-section">    </header>

            <h3>基本信息</h3>

            <div class="info-grid">    <article class="section-card">

              <div class="info-item">      <h3>词条内容</h3>

                <label>编号</label>      <p>演示数据：从接口获取词条详情。</p>

                <span>{{ word.json_data.serial_number }}</span>    </article>

              </div>  </section>

              <div class="info-item"></template>

                <label>中文名称</label>

                <span>{{ word.json_data.chinese_name }}</span><script setup lang="ts">

              </div>import { useRoute } from "vue-router";

              <div class="info-item">

                <label>英文名称</label>const route = useRoute();

                <span>{{ word.json_data.english_name }}</span>const id = route.params.id as string;

              </div></script>

              <div class="info-item">
                <label>缩写</label>
                <span>{{ word.json_data.abbr }}</span>
              </div>
              <div class="info-item full-width">
                <label>定义</label>
                <p>{{ word.json_data.definition }}</p>
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
import WordService, { Word } from '../../api/WordService';
import AdminService from '../../api/AdminService';
import { getUser } from '../../api/AuthService';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const loading = ref(true);
const submitting = ref(false);
const word = ref<Word | null>(null);
const reviewStatus = ref('passed');
const reviewComment = ref('');

onMounted(async () => {
  try {
    word.value = await WordService.getWord(id);
    if (word.value) {
        reviewStatus.value = word.value.json_data.review_status === 'submitted' ? 'passed' : word.value.json_data.review_status;
        reviewComment.value = word.value.json_data.rejected_reason || '';
    }
  } catch (e) {
    console.error(e);
    alert('加载失败');
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (!word.value) return;
  
  submitting.value = true;
  try {
    const userInfo = getUser();
    const reviewer = (userInfo && userInfo.username) ? userInfo.username : 'admin'; 
    
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
