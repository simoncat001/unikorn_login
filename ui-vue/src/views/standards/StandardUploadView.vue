<template>
  <div class="standard-upload-page">
    <MainAppBar />
    
    <div class="content-wrapper">
      <div class="form-card">
        <h1 class="page-title">上传数据标准</h1>
        
        <div class="form-group">
          <label class="form-label required">标准中文名称</label>
          <input 
            v-model="nameZh" 
            type="text" 
            class="form-input" 
            placeholder="请输入标准中文名称"
          />
        </div>

        <div class="form-group">
          <label class="form-label required">标准英文名称</label>
          <input 
            v-model="nameEn" 
            type="text" 
            class="form-input" 
            placeholder="请输入标准英文名称"
          />
        </div>

        <div class="form-group">
          <label class="form-label required">标准文档 (PDF)</label>
          <div 
            class="upload-area"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input 
              type="file" 
              ref="fileInput" 
              accept=".pdf" 
              class="hidden-input"
              @change="handleFileChange"
            />
            <div v-if="!selectedFile" class="upload-placeholder">
              <span class="upload-icon">📄</span>
              <p>点击或拖拽上传 PDF 文件</p>
            </div>
            <div v-else class="file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <button v-if="uploadStatus === 'idle'" class="upload-btn-small" @click.stop="handleUploadFile">上传</button>
              <button v-if="uploadStatus === 'success'" class="delete-btn-small" @click.stop="handleDeleteFile">删除</button>
              <button v-if="uploadStatus === 'idle'" class="remove-btn" @click.stop="removeFile">×</button>
            </div>
          </div>
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <div v-if="uploadStatus === 'success'" class="upload-success-msg">
            文件上传成功
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-cancel" @click="goBack">取消</button>
          <button 
            class="btn-submit" 
            :disabled="!isValid || isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? '提交中...' : '提交' }}
          </button>
        </div>

        <div v-if="message" :class="['message-banner', messageType]">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import MainAppBar from '@/components/MainAppBar.vue';
import StandardService from '@/api/StandardService';
import { getUser } from '@/api/AuthService';

const router = useRouter();
const nameZh = ref('');
const nameEn = ref('');
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref('info');
const uploadProgress = ref(0);
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle');
const uploadedFileKey = ref('');

const isValid = computed(() => {
  return nameZh.value.trim() && nameEn.value.trim() && uploadStatus.value === 'success';
});

const triggerFileInput = () => {
  if (uploadStatus.value === 'success') return;
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    validateAndSetFile(target.files[0]);
  }
};

const handleDrop = (event: DragEvent) => {
  if (uploadStatus.value === 'success') return;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    validateAndSetFile(event.dataTransfer.files[0]);
  }
};

const validateAndSetFile = (file: File) => {
  if (file.type !== 'application/pdf') {
    showMessage('请上传 PDF 格式的文件', 'error');
    return;
  }
  selectedFile.value = file;
  uploadStatus.value = 'idle';
  uploadedFileKey.value = '';
  showMessage('', 'info');
};

const removeFile = () => {
  selectedFile.value = null;
  uploadStatus.value = 'idle';
  uploadedFileKey.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleUploadFile = async () => {
  if (!selectedFile.value) return;
  
  uploadStatus.value = 'uploading';
  uploadProgress.value = 0;
  
  try {
    const uploadRes = await StandardService.uploadStandardFile(selectedFile.value, (percent) => {
      uploadProgress.value = percent;
    });

    if (!uploadRes.key) {
      throw new Error("Upload failed: No key returned");
    }
    
    uploadedFileKey.value = uploadRes.key;
    uploadStatus.value = 'success';
    showMessage('文件上传成功', 'success');
  } catch (e) {
    console.error(e);
    uploadStatus.value = 'error';
    showMessage('文件上传失败，请重试', 'error');
  }
};

const handleDeleteFile = async () => {
  if (!uploadedFileKey.value) return;
  
  if (!confirm('确定要删除已上传的文件吗？')) return;

  try {
    await StandardService.deleteStandardFile(uploadedFileKey.value);
    removeFile();
    showMessage('文件已删除', 'info');
  } catch (e) {
    console.error(e);
    showMessage('删除文件失败', 'error');
  }
};

const showMessage = (msg: string, type: 'info' | 'success' | 'error') => {
  message.value = msg;
  messageType.value = type;
};

const handleSubmit = async () => {
  if (!isValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    const user = getUser();
    // Create Standard
    await StandardService.createStandard({
      name_zh: nameZh.value,
      name_en: nameEn.value,
      file_url: uploadedFileKey.value,
      owner: user?.user_name
    });

    showMessage('提交成功！', 'success');
    setTimeout(() => {
      router.push('/'); 
    }, 1500);
  } catch (e) {
    console.error(e);
    showMessage('提交失败，请重试', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.standard-upload-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content-wrapper {
  padding-top: 80px;
  display: flex;
  justify-content: center;
}

.form-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-label.required::after {
  content: " *";
  color: #f44336;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  border-color: #3f51b5;
  outline: none;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #3f51b5;
}

.hidden-input {
  display: none;
}

.upload-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
}

.upload-placeholder {
  color: #666;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #e3f2fd;
  padding: 8px 16px;
  border-radius: 4px;
  color: #1976d2;
}

.upload-btn-small {
  background: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn-small {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 12px;
}

.upload-success-msg {
  color: #2e7d32;
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: #d32f2f;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.progress-bar {
  margin-top: 10px;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3f51b5;
  transition: width 0.3s ease;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 32px;
  background: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:disabled {
  background: #9fa8da;
  cursor: not-allowed;
}

.message-banner {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.message-banner.error {
  background: #ffebee;
  color: #c62828;
}

.message-banner.success {
  background: #e8f5e9;
  color: #2e7d32;
}
</style>
