<template>
  <div class="schema-form">
    <template v-if="schema && schema.type === 'object'">
      <div v-for="(propSchema, propName) in schema.properties" :key="propName" class="form-row">
        <label class="form-label" :class="{ required: isRequired(String(propName)) }">
          {{ propSchema.title || propName }}
        </label>
        
        <div class="input-wrapper">
            <!-- File Upload (String with format data-url or widget file) -->
            <div v-if="isFileField(propSchema, String(propName))" class="file-upload-wrapper">
                <div class="file-input-row">
                    <input
                        type="file"
                        :ref="(el) => setFileInputRef(el, String(propName))"
                        @change="(e) => handleFileSelect(e, String(propName))"
                        class="form-file-input"
                        :disabled="fileUploadStates[propName]?.status === 'uploading'"
                    />
                    <button 
                        v-if="fileUploadStates[propName]?.status === 'selected' || fileUploadStates[propName]?.status === 'error'"
                        type="button" 
                        class="btn-upload"
                        @click="triggerUpload(String(propName))"
                    >
                        {{ fileUploadStates[propName]?.status === 'error' ? '重试' : '上传' }}
                    </button>
                </div>

                <!-- Progress Bar -->
                <div v-if="fileUploadStates[propName]?.status === 'uploading'" class="progress-bar-container">
                    <div class="progress-bar" :style="{ width: fileUploadStates[propName]?.progress + '%' }"></div>
                    <span class="progress-text">{{ fileUploadStates[propName]?.progress }}%</span>
                </div>

                <!-- Preview / Status -->
                <div v-if="formData[propName]" class="file-preview">
                    <span class="file-name">{{ getFileName(formData[propName]) }}</span>
                    <button type="button" @click="removeFile(String(propName))" class="btn-remove-file">✕</button>
                </div>
                
                <div v-if="fileUploadStates[propName]?.message" class="upload-status" :class="fileUploadStates[propName]?.status">
                    {{ fileUploadStates[propName]?.message }}
                </div>
            </div>

            <!-- String -->
            <input
            v-else-if="propSchema.type === 'string' && !propSchema.enum"
            v-model="formData[propName]"
            type="text"
            class="form-input"
            :placeholder="propSchema.description"
            />

            <!-- Enum Select -->
            <select
            v-else-if="propSchema.enum"
            v-model="formData[propName]"
            class="form-select"
            >
            <option :value="undefined">请选择</option>
            <option v-for="opt in propSchema.enum" :key="opt" :value="opt">
                {{ opt }}
            </option>
            </select>

            <!-- Number -->
            <input
            v-else-if="propSchema.type === 'number' || propSchema.type === 'integer'"
            v-model.number="formData[propName]"
            type="number"
            class="form-input"
            />

            <!-- Boolean -->
            <div v-else-if="propSchema.type === 'boolean'" class="checkbox-wrapper">
                <input
                type="checkbox"
                v-model="formData[propName]"
                />
            </div>

            <!-- Object (Recursive) -->
            <div v-else-if="propSchema.type === 'object'" class="nested-object">
                <SchemaForm
                    v-model="formData[propName]"
                    :schema="propSchema"
                    :word-order="getNestedWordOrder(String(propName))"
                />
            </div>

            <!-- Array -->
            <div v-else-if="propSchema.type === 'array'" class="array-field">
                <div v-for="(item, index) in formData[propName]" :key="index" class="array-item">
                    <div class="array-item-content">
                        <SchemaForm
                            v-if="propSchema.items.type === 'object'"
                            v-model="formData[propName][index]"
                            :schema="propSchema.items"
                            :word-order="getNestedWordOrder(String(propName))"
                        />
                        <input
                            v-else
                            v-model="formData[propName][index]"
                            class="form-input"
                        />
                    </div>
                    <button type="button" @click="removeArrayItem(String(propName), index)" class="btn-remove" title="删除">
                        <span class="icon-minus">-</span>
                    </button>
                </div>
                <button type="button" @click="addArrayItem(String(propName), propSchema.items)" class="btn-add">
                    + 添加 {{ propSchema.title || '项目' }}
                </button>
            </div>
        </div>
        <div v-if="propSchema.description" class="field-description">{{ propSchema.description }}</div>
      </div>
    </template>
    <div v-else-if="!schema">
        <p class="no-schema">暂无表单定义</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import DevelopmentDataService from '@/api/DevelopmentDataService';

const props = defineProps<{
  schema: any;
  modelValue: any;
  wordOrder?: any[];
}>();

const emit = defineEmits(['update:modelValue']);

const formData = computed({
  get: () => props.modelValue || {},
  set: (val) => emit('update:modelValue', val)
});

const uploadStatus = ref<Record<string, string>>({});

interface FileUploadState {
    status: 'idle' | 'selected' | 'uploading' | 'success' | 'error';
    progress: number;
    file?: File;
    message?: string;
}

const fileUploadStates = ref<Record<string, FileUploadState>>({});
const fileInputRefs = ref<Record<string, HTMLInputElement>>({});

const setFileInputRef = (el: any, propName: string) => {
    if (el) {
        fileInputRefs.value[propName] = el as HTMLInputElement;
    }
};

// Initialize object properties if missing
watch(() => props.schema, (newSchema) => {
    if (newSchema && newSchema.type === 'object' && newSchema.properties) {
        if (!props.modelValue) {
            emit('update:modelValue', {});
        }
    }
}, { immediate: true });

const isRequired = (propName: string) => {
  return props.schema.required?.includes(propName);
};

const isFileField = (schema: any, propName: string) => {
    // Check schema first
    if (schema.type === 'string' && (schema.format === 'data-url' || schema['ui:widget'] === 'file')) {
        return true;
    }
    
    // Check wordOrder
    if (props.wordOrder) {
        const orderItem = props.wordOrder.find((item: any) => item.title === propName);
        if (orderItem && (orderItem.type === 'file' || orderItem.type === 'image')) {
            return true;
        }
    }
    return false;
};

const getNestedWordOrder = (propName: string) => {
    if (!props.wordOrder) return undefined;
    const orderItem = props.wordOrder.find((item: any) => item.title === propName);
    return orderItem ? orderItem.order : undefined;
};

const handleFileSelect = (event: Event, propName: string) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const file = target.files[0];
        fileUploadStates.value[propName] = {
            status: 'selected',
            progress: 0,
            file: file,
            message: '已选择文件，请点击上传'
        };
    }
};

const triggerUpload = async (propName: string) => {
    const state = fileUploadStates.value[propName];
    if (!state || !state.file) return;

    state.status = 'uploading';
    state.progress = 0;
    state.message = '上传中...';

    try {
        const res = await DevelopmentDataService.uploadFile(state.file, (percent) => {
            state.progress = Math.round(percent);
        });
        
        if (res && res.file_url) {
            formData.value[propName] = res.file_url;
            state.status = 'success';
            state.message = '上传成功';
        } else {
             formData.value[propName] = res.data?.file_url || res.file_url || res.url || "UPLOAD_FAILED";
             state.status = 'success';
             state.message = '上传成功';
        }
    } catch (e) {
        console.error(e);
        state.status = 'error';
        state.message = '上传失败';
    }
};

const removeFile = async (propName: string) => {
    const fileUrl = formData.value[propName];
    
    // Try to delete from server if it's an uploaded file
    if (fileUrl && typeof fileUrl === 'string' && fileUrl.includes('/api/download/')) {
        try {
            await DevelopmentDataService.deleteFile(fileUrl);
        } catch (e) {
            console.error("Failed to delete file from server", e);
        }
    }

    formData.value[propName] = '';
    if (fileUploadStates.value[propName]) {
        fileUploadStates.value[propName] = {
            status: 'idle',
            progress: 0
        };
    }
    if (fileInputRefs.value[propName]) {
        fileInputRefs.value[propName].value = '';
    }
};

const getFileName = (url: string) => {
    if (!url) return '';
    return url.split('/').pop() || url;
};

const addArrayItem = (propName: string, itemSchema: any) => {
    if (!formData.value[propName]) {
        formData.value[propName] = [];
    }
    
    let newItem: any = '';
    if (itemSchema.type === 'object') {
        newItem = {};
    } else if (itemSchema.type === 'number') {
        newItem = 0;
    }
    
    formData.value[propName].push(newItem);
};

const removeArrayItem = (propName: string, index: number) => {
    formData.value[propName].splice(index, 1);
};
</script>

<style scoped>
.form-row {
  margin-bottom: 1.5rem;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}
.required::after {
  content: " *";
  color: #ef4444;
}

.file-upload-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #f3f4f6;
    padding: 0.5rem;
    border-radius: 0.375rem;
}

.file-name {
    font-size: 0.875rem;
    color: #4b5563;
    word-break: break-all;
}

.btn-remove-file {
    color: #ef4444;
    font-size: 0.875rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0 0.5rem;
}

.btn-remove-file:hover {
    text-decoration: underline;
}

.upload-status {
    font-size: 0.875rem;
    color: #6b7280;
    margin-left: 0.5rem;
}

.file-input-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-upload {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
}

.btn-upload:hover {
    background-color: #1d4ed8;
}

.progress-bar-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.5rem;
}

.progress-bar {
    height: 8px;
    background-color: #2563eb;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 2.5rem;
}

.upload-status.success {
    color: #059669;
}

.upload-status.error {
    color: #dc2626;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #fff;
}
.form-input:focus, .form-select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
.nested-object {
    border-left: 3px solid #e5e7eb;
    padding-left: 1rem;
    margin-top: 0.5rem;
}
.array-field {
    border: 1px solid #e5e7eb;
    padding: 1rem;
    border-radius: 4px;
    background-color: #f9fafb;
}
.array-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed #e5e7eb;
}
.array-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}
.array-item-content {
    flex: 1;
    margin-right: 1rem;
}
.btn-add {
    color: #2563eb;
    background: #eff6ff;
    border: 1px dashed #2563eb;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    margin-top: 0.5rem;
    transition: all 0.2s;
}
.btn-add:hover {
    background: #dbeafe;
}
.btn-remove {
    color: #ef4444;
    background: #fff;
    border: 1px solid #ef4444;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.btn-remove:hover {
    background: #fef2f2;
}
.icon-minus {
    font-size: 1.5rem;
    line-height: 1;
    margin-top: -4px;
}
.field-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
}
.checkbox-wrapper {
    display: flex;
    align-items: center;
    height: 42px;
}
.checkbox-wrapper input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
}
.no-schema {
    color: #9ca3af;
    font-style: italic;
    text-align: center;
    padding: 2rem;
}

.file-upload-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #f3f4f6;
    padding: 0.5rem;
    border-radius: 0.375rem;
}

.file-name {
    font-size: 0.875rem;
    color: #4b5563;
    word-break: break-all;
}

.btn-remove-file {
    color: #ef4444;
    font-size: 0.875rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0 0.5rem;
}

.btn-remove-file:hover {
    text-decoration: underline;
}

.upload-status {
    font-size: 0.875rem;
    color: #6b7280;
    margin-left: 0.5rem;
}

.file-input-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-upload {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
}

.btn-upload:hover {
    background-color: #1d4ed8;
}

.progress-bar-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.5rem;
}

.progress-bar {
    height: 8px;
    background-color: #2563eb;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 2.5rem;
}

.upload-status.success {
    color: #059669;
}

.upload-status.error {
    color: #dc2626;
}
</style>