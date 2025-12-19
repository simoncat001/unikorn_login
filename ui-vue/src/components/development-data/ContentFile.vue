<template>
  <div class="content-block">
    <a
      target="_blank"
      rel="noreferrer"
      :href="downloadUrl"
      class="download-link"
      :title="`下载文件: ${finalDisplayName}`"
    >
      {{ finalDisplayName }}
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserFile } from '@/api/DevelopmentDataService';

const props = defineProps<{
  file: UserFile;
}>();

const fileInfo = computed(() => {
  let displayName = props.file.name;
  let objectKey = "";

  // 1. 先清理末尾的特殊字符（冒号、分号等）
  displayName = displayName.replace(/[:;]+$/, "");

  // 2. 移除 file: 前缀
  displayName = displayName.replace(/^file:/, '');

  try {
    // 尝试解析为URL
    if (displayName.startsWith('http://') || displayName.startsWith('https://')) {
      const url = new URL(displayName);
      // 路径格式: /bucket/path/to/file.ext
      const pathParts = url.pathname.split('/').filter(p => p);

      if (pathParts.length >= 2) {
        // 第一部分是bucket，剩余部分是文件路径
        const bucket = pathParts[0];
        const filePath = pathParts.slice(1).join('/');
        objectKey = filePath;
        // 显示名称只显示最后的文件名
        displayName = pathParts[pathParts.length - 1];
      } else if (pathParts.length === 1) {
        // 只有文件名，没有路径
        objectKey = pathParts[0];
        displayName = pathParts[0];
      }
    } else {
      // 不是URL格式，直接使用原值
      displayName = displayName.replace(/^\/api\/download\//, '');
      objectKey = displayName;
    }
  } catch (e) {
    // URL解析失败，使用原始值
    displayName = displayName.replace(/^\/api\/download\//, '');
    objectKey = displayName;
  }

  // 构建下载链接，使用解析出的objectKey
  // 先解码一次，防止双重编码，然后再编码
  let finalKey = objectKey || displayName;
  try {
    // 尝试解码，如果已经是编码状态会正确解码，如果不是也不会出错
    finalKey = decodeURIComponent(finalKey);
  } catch (e) {
    // 解码失败，使用原值
  }

  // 对于显示名称也进行解码
  let finalDisplayName = displayName;
  try {
    finalDisplayName = decodeURIComponent(displayName);
  } catch (e) {
    // 解码失败，使用原值
  }

  const downloadUrl = `/api/download/${encodeURIComponent(finalKey)}`;

  return {
    finalDisplayName,
    downloadUrl
  };
});

const finalDisplayName = computed(() => fileInfo.value.finalDisplayName);
const downloadUrl = computed(() => fileInfo.value.downloadUrl);

</script>

<style scoped>
.content-block {
  display: flex;
  flex-grow: 1;
  padding: 16px;
  border: solid 0.5px #e0e0e0; /* lighterBorder approximation */
}

.download-link {
  color: #0052cc; /* primaryColor approximation */
  text-decoration: underline;
  word-break: break-all;
}

.download-link:hover {
  text-decoration: none;
}
</style>
